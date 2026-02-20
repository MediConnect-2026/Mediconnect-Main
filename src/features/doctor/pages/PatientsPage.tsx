import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MyPatientsTable from "../components/patients/PatientsTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import MCGeneratePDF from "@/shared/components/MCGeneratePDF";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import {
  Filter,
  Users,
  ShieldAlert,
  AlertTriangle,
  BarChart2,
} from "lucide-react";
import FilterMyPatients from "../components/filters/FilterPatients";

import type { Patient } from "../components/patients/PatientsTable";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockPatients: Patient[] = [
  {
    id: "p-1",
    conversationId: "conv-1",
    patientName: "Carlos Guerrero",
    patientImage: "https://randomuser.me/api/portraits/men/11.jpg",
    age: 34,
    gender: "male",
    phone: "809-432-9532",
    email: "Carlitos02@gmail.com",
    conditionsCount: 0,
    allergiesCount: 0,
    lastVisit: "15/03/2024",
    serviceReceived: "Consulta General",
    specialty: "Cardiología",
    location: "Clínica Santo Domingo",
  },
  {
    id: "p-2",
    conversationId: "conv-2",
    patientName: "Manuel Guzman",
    patientImage: "https://randomuser.me/api/portraits/men/12.jpg",
    age: 21,
    gender: "male",
    phone: "809-432-9532",
    email: "ManuelG@gmail.com",
    conditionsCount: 0,
    allergiesCount: 1,
    lastVisit: "18/03/2024",
    serviceReceived: "Cirugía General",
    specialty: "Cirugía General",
    location: "Clínica Santo Domingo",
  },
  {
    id: "p-3",
    conversationId: "conv-3",
    patientName: "Edwin Lopez",
    patientImage: "https://randomuser.me/api/portraits/men/13.jpg",
    age: 45,
    gender: "male",
    phone: "809-432-9532",
    email: "edwin.lopez@email.com",
    conditionsCount: 2,
    allergiesCount: 1,
    lastVisit: "15/03/2024",
    serviceReceived: "Control Metabólico",
    specialty: "Endocrinología",
    location: "Clínica Santo Domingo",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const matchesDateRange = (dateStr: string, range?: [Date, Date]): boolean => {
  if (!range) return true;
  const d = parseDate(dateStr);
  d.setHours(0, 0, 0, 0);
  const start = new Date(range[0]);
  start.setHours(0, 0, 0, 0);
  const end = new Date(range[1]);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

// ─── Page ─────────────────────────────────────────────────────────────────────
function PatientsPage() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    gender: "all",
    specialty: "all",
    location: "all",
    hasCondition: "all",
    hasAllergy: "all",
    lastVisitRange: undefined as [Date, Date] | undefined,
  });

  // Contar filtros activos
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) =>
    key === "lastVisitRange" ? value !== undefined : value !== "all",
  ).length;

  const clearFilters = () =>
    setFilters({
      gender: "all",
      specialty: "all",
      location: "all",
      hasCondition: "all",
      hasAllergy: "all",
      lastVisitRange: undefined,
    });

  // Filtrar pacientes
  const filteredPatients = useMemo(() => {
    return mockPatients.filter((p) => {
      const matchesSearch =
        p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.serviceReceived.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender =
        filters.gender === "all" ||
        (filters.gender === "male" && p.gender === "male") ||
        (filters.gender === "female" && p.gender === "female") ||
        (filters.gender === "other" && p.gender === "other");

      const matchesSpecialty =
        filters.specialty === "all" ||
        p.specialty.toLowerCase().includes(filters.specialty.replace("-", " "));

      const matchesLocation =
        filters.location === "all" ||
        p.location.toLowerCase().includes(filters.location.replace("-", " "));

      const matchesCondition =
        filters.hasCondition === "all" ||
        (filters.hasCondition === "yes" && p.conditionsCount > 0) ||
        (filters.hasCondition === "no" && p.conditionsCount === 0);

      const matchesAllergy =
        filters.hasAllergy === "all" ||
        (filters.hasAllergy === "yes" && p.allergiesCount > 0) ||
        (filters.hasAllergy === "no" && p.allergiesCount === 0);

      const matchesDate = matchesDateRange(p.lastVisit, filters.lastVisitRange);

      return (
        matchesSearch &&
        matchesGender &&
        matchesSpecialty &&
        matchesLocation &&
        matchesCondition &&
        matchesAllergy &&
        matchesDate
      );
    });
  }, [searchTerm, filters]);

  // Métricas
  const avgAge =
    mockPatients.length > 0
      ? (
          mockPatients.reduce((sum, p) => sum + p.age, 0) / mockPatients.length
        ).toFixed(1)
      : "0";

  const metrics = [
    {
      title: t("patients.metrics.total"),
      value: mockPatients.length,
      subtitle: t("patients.metrics.totalSubtitle"),
      icon: <Users />,
    },
    {
      title: t("patients.metrics.withConditions"),
      value: mockPatients.filter((p) => p.conditionsCount > 0).length,
      subtitle: t("patients.metrics.withConditionsSubtitle"),
      icon: <ShieldAlert />,
    },
    {
      title: t("patients.metrics.withAllergies"),
      value: mockPatients.filter((p) => p.allergiesCount > 0).length,
      subtitle: t("patients.metrics.withAllergiesSubtitle"),
      icon: <AlertTriangle />,
    },
    {
      title: t("patients.metrics.avgAge"),
      value: `${avgAge} ${t("patients.metrics.years")}`,
      subtitle: t("patients.metrics.avgAgeSubtitle"),
      icon: <BarChart2 />,
    },
  ];

  // Search
  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("patients.searchPlaceholder")}
        value={searchTerm}
        onChange={setSearchTerm}
      />
    </div>
  );

  // PDF
  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        await MCGeneratePDF({
          columns: [
            { title: t("patients.table.patient"), key: "patientName" },
            { title: t("patients.table.age"), key: "age" },
            { title: t("patients.table.gender"), key: "gender" },
            { title: t("patients.table.contact"), key: "phone" },
            { title: t("patients.table.lastVisit"), key: "lastVisit" },
            {
              title: t("patients.table.serviceSpecialty"),
              key: "serviceReceived",
            },
            { title: t("patients.table.location"), key: "location" },
          ],
          data: filteredPatients.map((p) => ({
            ...p,
            gender: t(`patients.table.${p.gender}`),
          })),
          fileName: "pacientes",
          title: t("patients.title"),
          subtitle: t("patients.subtitle"),
        });
      }}
    />
  );

  // Filters
  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
    >
      <FilterMyPatients
        filters={filters}
        onFiltersChange={(newFilters) =>
          setFilters((prev) => ({ ...prev, ...newFilters }))
        }
      />
    </MCFilterPopover>
  );

  // Empty state
  const emptyState = (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center gap-2 text-primary">
            {activeFiltersCount > 0 ? (
              <Filter className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            ) : (
              <Users className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle
              className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {activeFiltersCount > 0
                ? t("patients.empty.noResults")
                : t("patients.empty.noPatients")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {activeFiltersCount > 0
              ? t("patients.empty.noResultsDescription")
              : t("patients.empty.noPatientsDescription")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        {activeFiltersCount > 0 && (
          <MCButton
            variant="outline"
            onClick={clearFilters}
            className={isMobile ? "px-4 py-2" : "px-6 py-2"}
            size="sm"
          >
            {t("patients.empty.clearFilters")}
          </MCButton>
        )}
      </EmptyContent>
    </Empty>
  );

  const tableComponent =
    filteredPatients.length === 0 ? (
      emptyState
    ) : (
      <MyPatientsTable patients={filteredPatients} />
    );

  return (
    <MCTablesLayouts
      title={t("patients.title")}
      metrics={metrics}
      filtersInlineWithTitle
      tableComponent={tableComponent}
      searchComponent={searchComponent}
      pdfGeneratorComponent={pdfGeneratorComponent}
      filterComponent={filterComponent}
    />
  );
}

export default PatientsPage;
