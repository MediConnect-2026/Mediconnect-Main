import { useState, useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import { Filter, UserX } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCToogle from "@/shared/components/forms/MCToogle";
import FullFilterStaff from "@/features/center/filters/FullFilterStaff";

import StaffTable from "../components/staff/StaffTable";

// Types
type StaffFilters = {
  specialty: string | string[];
  rating: string | string[];
  languages: string | string[];
  experience: string | string[];
  status: string | string[];
  joinDate: { from: Date | null; to: Date | null };
};

// Mock data for staff
export const staffList = [
  {
    id: "s1",
    name: "Dra. María González",
    specialty: "Dermatología",
    rating: 4.8,
    yearsOfExperience: 12,
    languages: ["es", "en"],
    insuranceAccepted: ["senasa", "universal", "humano"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/women/44.jpg",
    joinDate: "2025-10-23",
    totalAppointments: 130,
    status: "active" as const,
  },
  {
    id: "s2",
    name: "Dr. Carlos Rodríguez",
    specialty: "Cardiología",
    rating: 4.9,
    yearsOfExperience: 18,
    languages: ["es", "en", "fr"],
    insuranceAccepted: ["palic", "humano", "mapfre"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/men/32.jpg",
    joinDate: "2025-09-15",
    totalAppointments: 98,
    status: "active" as const,
  },
  {
    id: "s3",
    name: "Dra. Ana Martínez",
    specialty: "Pediatría",
    rating: 4.7,
    yearsOfExperience: 8,
    languages: ["es"],
    insuranceAccepted: ["senasa", "universal"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/women/68.jpg",
    joinDate: "2025-08-10",
    totalAppointments: 156,
    status: "inactive" as const,
  },
  {
    id: "s4",
    name: "Dr. Roberto Díaz",
    specialty: "Neurología",
    rating: 4.6,
    yearsOfExperience: 15,
    languages: ["es", "en"],
    insuranceAccepted: ["humano", "palic"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/men/65.jpg",
    joinDate: "2025-07-05",
    totalAppointments: 87,
    status: "active" as const,
  },
  {
    id: "s5",
    name: "Dra. Laura Sánchez",
    specialty: "Medicina Interna",
    rating: 4.5,
    yearsOfExperience: 10,
    languages: ["es", "en", "it"],
    insuranceAccepted: ["senasa", "mapfre", "universal"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/women/81.jpg",
    joinDate: "2025-06-20",
    totalAppointments: 112,
    status: "active" as const,
  },
  {
    id: "s6",
    name: "Dr. Fernando López",
    specialty: "Ginecología",
    rating: 4.3,
    yearsOfExperience: 20,
    languages: ["es"],
    insuranceAccepted: ["palic", "universal", "humano"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/men/77.jpg",
    joinDate: "2025-05-12",
    totalAppointments: 203,
    status: "active" as const,
  },
  {
    id: "s7",
    name: "Dra. Carmen Vega",
    specialty: "Traumatología",
    rating: 4.8,
    yearsOfExperience: 14,
    languages: ["es", "en"],
    insuranceAccepted: ["senasa", "humano"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/women/55.jpg",
    joinDate: "2025-04-08",
    totalAppointments: 145,
    status: "inactive" as const,
  },
  {
    id: "s8",
    name: "Dr. Andrés Mejía",
    specialty: "Psiquiatría",
    rating: 4.9,
    yearsOfExperience: 11,
    languages: ["es", "en", "fr"],
    insuranceAccepted: ["universal", "mapfre"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/men/45.jpg",
    joinDate: "2025-03-25",
    totalAppointments: 178,
    status: "active" as const,
  },
  {
    id: "s9",
    name: "Dra. Patricia Herrera",
    specialty: "Cardiología",
    rating: 4.4,
    yearsOfExperience: 9,
    languages: ["es"],
    insuranceAccepted: ["senasa", "palic"],
    isFavorite: false,
    urlImage: "https://randomuser.me/api/portraits/women/33.jpg",
    joinDate: "2025-02-14",
    totalAppointments: 67,
    status: "active" as const,
  },
  {
    id: "s10",
    name: "Dr. Miguel Ángel Reyes",
    specialty: "Pediatría",
    rating: 4.7,
    yearsOfExperience: 16,
    languages: ["es", "en"],
    insuranceAccepted: ["humano", "universal", "mapfre"],
    isFavorite: true,
    urlImage: "https://randomuser.me/api/portraits/men/52.jpg",
    joinDate: "2025-01-30",
    totalAppointments: 192,
    status: "active" as const,
  },
];

const ITEMS_PER_PAGE = 8;

function StaffPage() {
  const { t } = useTranslation("center");
  const isMobile = useIsMobile();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  // Normaliza string | string[] → string[] siempre
  const toArray = (val: string | string[]): string[] => {
    if (!val || (Array.isArray(val) && val.length === 0)) return [];
    return Array.isArray(val) ? val : [val];
  };

  // ---------- FILTRADO ----------
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
        // Especialidad
        if (specialty.length > 0 && !specialty.includes("all")) {
          if (!specialty.includes(staff.specialty)) return false;
        }

        // Calificación — múltiples selecciones = OR: pasa si cumple al menos una
        if (
          rating.length > 0 &&
          !rating.includes("0") &&
          !rating.includes("all")
        ) {
          const minRating = Math.min(...rating.map((r) => parseFloat(r)));
          if (staff.rating < minRating) return false;
        }

        // Idiomas — OR: pasa si habla al menos uno de los seleccionados
        if (languages.length > 0 && !languages.includes("all")) {
          const hasCommonLanguage = staff.languages.some((lang) =>
            languages.includes(lang),
          );
          if (!hasCommonLanguage) return false;
        }

        // Experiencia — OR: pasa si cae en al menos uno de los rangos seleccionados
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

        // Estado
        if (status.length > 0 && !status.includes("all")) {
          if (!status.includes(staff.status)) return false;
        }

        // Fecha de conexión
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
  }, [search, filters]);

  // ---------- Pagination ----------
  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);
  const paginatedStaff = filteredStaff.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // ---------- HELPERS ----------
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

  const hasActiveFilters = getActiveFiltersCount() > 0;

  // ---------- Toggle view ----------
  const handleToggle = (val: string) => {
    setShowCards(val === "card");
    try {
      localStorage.setItem("staffView", val);
    } catch {}
  };

  const toggleView = (
    <MCToogle value={showCards ? "card" : "list"} onChange={handleToggle} />
  );

  // ---------- PDF ----------
  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        setIsLoading(true);
        await MCGeneratePDF({
          columns: [
            { title: "Doctor", key: "name" },
            { title: "Especialidad", key: "specialty" },
            { title: "Calificación", key: "rating" },
            { title: "Experiencia (años)", key: "yearsOfExperience" },
            { title: "Citas Totales", key: "totalAppointments" },
            { title: "Fecha Conexión", key: "joinDate" },
          ],
          data: filteredStaff,
          fileName: "equipo-medico",
          title: "Equipo de Atención Médica",
          subtitle: "Centro Médico - Staff",
        });
        setIsLoading(false);
      }}
      loading={isLoading}
    />
  );

  // ---------- Filter component ----------
  const filterComponent = (
    <FullFilterStaff
      filters={filters}
      onFiltersChange={updateFilters}
      onClearFilters={resetFilters}
      activeFiltersCount={getActiveFiltersCount()}
    />
  );

  // ---------- Search ----------
  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder="Buscar médico..."
        value={search}
        onChange={(value: string) => {
          setPage(1);
          setSearch(value);
        }}
      />
    </div>
  );

  // ---------- Empty state ----------
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
                ? "No se encontraron resultados"
                : "No hay personal médico"}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {hasActiveFilters
              ? "Intenta ajustar los filtros para encontrar lo que buscas."
              : "Aún no tienes personal médico registrado en tu centro."}
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
              Limpiar filtros
            </MCButton>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );

  // ---------- Pagination component ----------
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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              onClick={() => setPage(p)}
              isActive={page === p}
              className="cursor-pointer"
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
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

  // ---------- Table component ----------
  const tableComponent = showCards ? (
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
              id={staff.id}
              name={staff.name}
              specialty={staff.specialty}
              rating={staff.rating}
              yearsOfExperience={staff.yearsOfExperience}
              languages={staff.languages}
              insuranceAccepted={staff.insuranceAccepted}
              isFavorite={staff.isFavorite}
              urlImage={staff.urlImage}
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
      title="Personal Médico"
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
