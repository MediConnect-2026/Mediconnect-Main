import { useState } from "react";
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
import FilterMyDoctors from "../components/filters/FilterMyDoctors";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import { useTranslation } from "react-i18next";
import { Filter, UserX } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

// Define the DoctorFilters type to match FilterMyDoctors expectations
type DoctorFilters = {
  specialty: string;
  language: string;
  insurance: string;
  isFavorite: boolean | null;
  languages: string[];
  acceptingInsurance: string[];
  yearsOfExperience: number | null;
  rating: number | null;
};

const doctorsList = [
  {
    id: "d1",
    name: "Stephen Curry",
    specialty: "Cardiólogo",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["es", "en", "fr"],
    insuranceAccepted: ["senasa", "universal", "humano"],
    isFavorite: false,
    urlImage: "",
  },
  {
    id: "d2",
    name: "LeBron James",
    specialty: "Dermatóloga",
    rating: 4.9,
    yearsOfExperience: 10,
    languages: ["es", "en"],
    insuranceAccepted: ["palic", "humano"],
    isFavorite: true,
    urlImage: "",
  },
  {
    id: "d3",
    name: "Conor McGregor",
    specialty: "Pediatra",
    rating: 4.7,
    yearsOfExperience: 8,
    languages: ["es"],
    insuranceAccepted: ["universal"],
    isFavorite: true,
    urlImage: "",
  },
  {
    id: "d4",
    name: "Sofía Ramírez",
    specialty: "Endocrinóloga",
    rating: 4.6,
    yearsOfExperience: 12,
    languages: ["es", "fr"],
    insuranceAccepted: ["senasa", "mapfre", "yunen"],
    isFavorite: true,
    urlImage: "",
  },
  {
    id: "d5",
    name: "Luis Fernández",
    specialty: "Ginecólogo",
    rating: 4.5,
    yearsOfExperience: 11,
    languages: ["es", "en"],
    insuranceAccepted: ["palic", "universal"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "d6",
    name: "Ana Torres",
    specialty: "Oftalmóloga",
    rating: 4.8,
    yearsOfExperience: 9,
    languages: ["es"],
    insuranceAccepted: ["senasa", "humano"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "d7",
    name: "Pedro Castillo",
    specialty: "Ortopedista",
    rating: 4.4,
    yearsOfExperience: 13,
    languages: ["es", "en"],
    insuranceAccepted: ["mapfre", "palic"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    id: "d8",
    name: "Gabriela Suárez",
    specialty: "Psiquiatra",
    rating: 4.9,
    yearsOfExperience: 7,
    languages: ["es", "en", "it"],
    insuranceAccepted: ["universal", "humano"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "d9",
    name: "Javier Peña",
    specialty: "Neurólogo",
    rating: 4.7,
    yearsOfExperience: 14,
    languages: ["es"],
    insuranceAccepted: ["senasa", "palic"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/men/77.jpg",
  },
  {
    id: "d10",
    name: "Lucía Vargas",
    specialty: "Nutrióloga",
    rating: 4.6,
    yearsOfExperience: 6,
    languages: ["es", "en"],
    insuranceAccepted: ["humano", "mapfre"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/women/81.jpg",
  },
];

function MyDoctorsPage() {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ajustar cards por página según dispositivo
  const CARDS_PER_PAGE = isMobile ? 4 : 8;

  const [filters, setFilters] = useState<DoctorFilters>({
    specialty: "",
    language: "",
    insurance: "",
    isFavorite: null,
    languages: [],
    acceptingInsurance: [],
    yearsOfExperience: null,
    rating: null,
  });

  // Filtering logic
  const filteredDoctors = doctorsList
    .filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((doctor) => {
      if (filters.specialty && doctor.specialty !== filters.specialty)
        return false;
      if (filters.language && !doctor.languages.includes(filters.language))
        return false;
      if (
        filters.insurance &&
        !doctor.insuranceAccepted.includes(filters.insurance)
      )
        return false;
      if (
        filters.isFavorite !== null &&
        doctor.isFavorite !== filters.isFavorite
      )
        return false;
      return true;
    });

  // Pagination
  const totalPages = Math.ceil(filteredDoctors.length / CARDS_PER_PAGE);
  const paginatedDoctors = filteredDoctors.slice(
    (page - 1) * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE,
  );

  // Filter helpers
  function getActiveFiltersCount() {
    const filtersCount = Object.values(filters).filter(
      (v) =>
        (typeof v === "string" && v !== "") ||
        (Array.isArray(v) && v.length > 0) ||
        (typeof v === "boolean" && v !== undefined) ||
        (typeof v === "number" && v !== null),
    ).length;

    return search.trim() !== "" ? filtersCount + 1 : filtersCount;
  }

  function resetFilters() {
    setFilters({
      specialty: "",
      language: "",
      insurance: "",
      isFavorite: null,
      languages: [],
      acceptingInsurance: [],
      yearsOfExperience: null,
      rating: null,
    });
    setPage(1);
  }

  function updateFilters(newFilters: Partial<DoctorFilters>) {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  }

  // PDF generator
  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        setIsLoading(true);
        await MCGeneratePDF({
          columns: [
            { title: t("myDoctors.pdfColumns.name"), key: "name" },
            { title: t("myDoctors.pdfColumns.specialty"), key: "specialty" },
            { title: t("myDoctors.pdfColumns.rating"), key: "rating" },
            {
              title: t("myDoctors.pdfColumns.yearsOfExperience"),
              key: "yearsOfExperience",
            },
            { title: t("myDoctors.pdfColumns.languages"), key: "languages" },
            {
              title: t("myDoctors.pdfColumns.insuranceAccepted"),
              key: "insuranceAccepted",
            },
          ],
          data: filteredDoctors,
          fileName: "mis-doctores",
          title: t("myDoctors.pdfTitle"),
          subtitle: t("myDoctors.pdfSubtitle"),
        });
        setIsLoading(false);
      }}
      loading={isLoading}
    />
  );

  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={getActiveFiltersCount()}
      onClearFilters={resetFilters}
    >
      <FilterMyDoctors filters={filters} onFiltersChange={updateFilters} />
    </MCFilterPopover>
  );

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // Empty state - Responsive
  const emptyComponent = (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2 px-4">
          <span className="flex items-center justify-center gap-2 text-primary">
            {hasActiveFilters ? (
              <Filter className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <UserX className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
            <EmptyTitle className="text-lg sm:text-xl font-semibold text-center">
              {hasActiveFilters
                ? t("myDoctors.empty.noResults")
                : t("myDoctors.empty.title")}
            </EmptyTitle>
          </span>
          <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto text-sm sm:text-base px-2">
            {hasActiveFilters
              ? t("myDoctors.empty.noResultsDescription")
              : t("myDoctors.empty.description")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col items-center gap-3 px-4">
          {hasActiveFilters && (
            <MCButton
              variant="outline"
              onClick={resetFilters}
              className="px-4 py-2 sm:px-6 w-full sm:w-auto"
              size="sm"
            >
              {t("myDoctors.empty.clearFilters")}
            </MCButton>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );

  // Search input - Responsive
  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("myDoctors.searchPlaceholder")}
        value={search}
        onChange={(value: string) => {
          setPage(1);
          setSearch(value);
        }}
      />
    </div>
  );

  // Pagination con páginas visibles limitadas en mobile
  const renderPaginationItems = () => {
    if (isMobile && totalPages > 5) {
      // En mobile, mostrar solo página actual y adyacentes
      const pages = [];
      const showPages = [page - 1, page, page + 1].filter(
        (p) => p > 0 && p <= totalPages,
      );

      // Primera página
      if (!showPages.includes(1)) {
        pages.push(
          <PaginationItem key={1}>
            <PaginationLink isActive={page === 1} onClick={() => setPage(1)}>
              1
            </PaginationLink>
          </PaginationItem>,
        );
        if (showPages[0] > 2) {
          pages.push(
            <PaginationItem key="ellipsis-start">
              <span className="px-2">...</span>
            </PaginationItem>,
          );
        }
      }

      // Páginas visibles
      showPages.forEach((p) => {
        pages.push(
          <PaginationItem key={p}>
            <PaginationLink isActive={page === p} onClick={() => setPage(p)}>
              {p}
            </PaginationLink>
          </PaginationItem>,
        );
      });

      // Última página
      if (!showPages.includes(totalPages)) {
        if (showPages[showPages.length - 1] < totalPages - 1) {
          pages.push(
            <PaginationItem key="ellipsis-end">
              <span className="px-2">...</span>
            </PaginationItem>,
          );
        }
        pages.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              isActive={page === totalPages}
              onClick={() => setPage(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      return pages;
    }

    // Desktop: mostrar todas las páginas
    return Array.from({ length: totalPages }).map((_, idx) => (
      <PaginationItem key={idx}>
        <PaginationLink
          isActive={page === idx + 1}
          onClick={() => setPage(idx + 1)}
        >
          {idx + 1}
        </PaginationLink>
      </PaginationItem>
    ));
  };

  // Table component - Grid responsive
  const tableComponent =
    filteredDoctors.length === 0 ? (
      emptyComponent
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-2 sm:px-0">
          {paginatedDoctors.map((doctor) => (
            <MCDoctorsCards
              key={doctor.id}
              id={doctor.id}
              name={doctor.name}
              specialty={doctor.specialty}
              rating={doctor.rating}
              yearsOfExperience={doctor.yearsOfExperience}
              languages={doctor.languages}
              insuranceAccepted={doctor.insuranceAccepted}
              isFavorite={doctor.isFavorite}
              urlImage={doctor.urlImage}
            />
          ))}
        </div>
        {/* Pagination - Responsive */}
        {totalPages > 1 && (
          <Pagination className="mt-6 sm:mt-8">
            <PaginationContent className="flex-wrap gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (page > 1) setPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : 0}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {renderPaginationItems()}
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (page < totalPages)
                      setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={page === totalPages}
                  tabIndex={page === totalPages ? -1 : 0}
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
      </>
    );

  return (
    <MCTablesLayouts
      title={t("myDoctors.title")}
      searchComponent={searchComponent}
      pdfGeneratorComponent={pdfGeneratorComponent}
      filterComponent={filterComponent}
      tableComponent={tableComponent}
    />
  );
}

export default MyDoctorsPage;
