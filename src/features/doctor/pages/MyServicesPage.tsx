import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MyServicesTable from "../components/healthService/MyServicesTable";
import MCTablesLayouts from "@/shared/components/tables/MCTablesLayouts";
import MCPDFButton from "@/shared/components/forms/MCPDFButton";
import MCToogle from "@/shared/components/forms/MCToogle";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/shared/ui/pagination";
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
  CalendarX,
  CheckCircle,
  Ban,
  Star,
  Layers,
} from "lucide-react";
import MCServiceCards from "@/shared/components/MCServiceCards";
import FilterMyServices from "../components/filters/FilterMyServices";
import MCNewButton from "@/shared/components/forms/MCNewButton";
import { ROUTES } from "@/router/routes";

const mockServices = [
  {
    id: "1",
    servicio: "Consulta General",
    especialidad: "Medicina General",
    ubicacion: ["Clínica Central", "Sucursal Norte"],
    tipo: "Presencial / Virtual",
    precio: "RD$1500",
    duracion: "30 min",
    rating: 4.8,
    estado: "Activo",
    imagen: "https://randomuser.me/api/portraits/men/1.jpg",
    title: "Consulta General",
    price: "RD$1500",
    description: "Consulta médica general completa",
    reviews: 124,
    type: "Presencial / Virtual",
    duration: "30 min",
    serviceId: "1",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    status: "active",
    isOwner: true,
  },
  {
    id: "2",
    servicio: "Consulta Cardiológica",
    especialidad: "Cardiología",
    ubicacion: ["Clínica Central", "Sucursal Sur"],
    tipo: "Presencial / Virtual",
    precio: "RD$2000",
    duracion: "45 min",
    rating: 4.9,
    estado: "Activo",
    imagen: "https://randomuser.me/api/portraits/men/2.jpg",
    title: "Consulta Cardiológica",
    price: "RD$2000",
    description: "Evaluación completa del sistema cardiovascular",
    reviews: 89,
    type: "Presencial / Virtual",
    duration: "45 min",
    serviceId: "2",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "active",
    isOwner: true,
  },
  {
    id: "3",
    servicio: "Consulta Pediátrica",
    especialidad: "Pediatría",
    ubicacion: ["Clínica Central", "Sucursal Este"],
    tipo: "Presencial",
    precio: "RD$1800",
    duracion: "40 min",
    rating: 4.7,
    estado: "Activo",
    imagen: "https://randomuser.me/api/portraits/women/3.jpg",
    title: "Consulta Pediátrica",
    price: "RD$1800",
    description: "Atención médica especializada para niños",
    reviews: 156,
    type: "Presencial",
    duration: "40 min",
    serviceId: "3",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    status: "active",
    isOwner: true,
  },
  {
    id: "4",
    servicio: "Teleconsulta",
    especialidad: "Medicina General",
    ubicacion: ["Virtual", "Casa"],
    tipo: "Virtual",
    precio: "RD$1200",
    duracion: "25 min",
    rating: 4.6,
    estado: "Activo",
    imagen: "https://randomuser.me/api/portraits/women/4.jpg",
    title: "Teleconsulta",
    price: "RD$1200",
    description: "Consulta médica virtual desde casa",
    reviews: 203,
    type: "Virtual",
    duration: "25 min",
    serviceId: "4",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
    status: "active",
    isOwner: true,
  },
  {
    id: "5",
    servicio: "Consulta Dermatológica",
    especialidad: "Dermatología",
    ubicacion: ["Clínica Central", "Sucursal Oeste"],
    tipo: "Presencial",
    precio: "RD$2200",
    duracion: "35 min",
    rating: 4.5,
    estado: "Inactivo",
    imagen: "https://randomuser.me/api/portraits/men/5.jpg",
    title: "Consulta Dermatológica",
    price: "RD$2200",
    description: "Evaluación de problemas de la piel",
    reviews: 67,
    type: "Presencial",
    duration: "35 min",
    serviceId: "5",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    status: "inactive",
    isOwner: true,
  },
  {
    id: "6",
    servicio: "Consulta Psicológica",
    especialidad: "Psicología",
    ubicacion: ["Clínica Central", "Sucursal Sur"],
    tipo: "Presencial / Virtual",
    precio: "RD$1600",
    duracion: "50 min",
    rating: 4.8,
    estado: "Inactivo",
    imagen: "https://randomuser.me/api/portraits/women/6.jpg",
    title: "Consulta Psicológica",
    price: "RD$1600",
    description: "Atención en salud mental y bienestar",
    reviews: 98,
    type: "Presencial / Virtual",
    duration: "50 min",
    serviceId: "6",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    status: "inactive",
    isOwner: true,
  },
];

const ITEMS_PER_PAGE = 8;

function MyServicesPage() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  // Estados
  const [showCards, setShowCards] = useState(() => {
    const saved = localStorage.getItem("myServicesView");
    return saved ? saved === "card" : true;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    servicio: "",
    especialidad: "",
    tipo: "",
    precio: "",
    duracion: "",
    rating: null as number | null,
    estado: "all",
  });

  // Contar filtros activos
  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== "" && value !== "all" && value !== null,
  ).length;

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      servicio: "",
      especialidad: "",
      tipo: "",
      precio: "",
      duracion: "",
      rating: null,
      estado: "all",
    });
  };

  // Guardar en localStorage cuando cambia
  const handleToggle = (val: string) => {
    setShowCards(val === "card");
    localStorage.setItem("myServicesView", val);
  };

  // Función para verificar si una duración coincide con el rango seleccionado
  const matchesDuracionRange = (duracion: string, filtro: string) => {
    if (!filtro) return true;
    const minutos = parseInt(duracion);
    switch (filtro) {
      case "corta":
        return minutos >= 15 && minutos <= 30;
      case "media":
        return minutos > 30 && minutos <= 45;
      case "larga":
        return minutos > 45 && minutos <= 60;
      case "extendida":
        return minutos > 60;
      default:
        return true;
    }
  };

  // Filtrar servicios
  const filteredServices = useMemo(() => {
    return mockServices.filter((service) => {
      // Búsqueda por texto
      const matchesSearch = service.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Filtros
      const matchesServicio =
        !filters.servicio ||
        service.title
          .toLowerCase()
          .includes(filters.servicio.replace("-", " "));
      const matchesEspecialidad =
        !filters.especialidad ||
        service.especialidad
          .toLowerCase()
          .includes(filters.especialidad.replace("-", " "));
      const matchesTipo =
        !filters.tipo || service.tipo.toLowerCase().includes(filters.tipo);
      const matchesEstado =
        filters.estado === "all" || service.status === filters.estado;
      const matchesRating = !filters.rating || service.rating >= filters.rating;
      const matchesDuracion = matchesDuracionRange(
        service.duracion,
        filters.duracion,
      );

      return (
        matchesSearch &&
        matchesServicio &&
        matchesEspecialidad &&
        matchesTipo &&
        matchesEstado &&
        matchesRating &&
        matchesDuracion
      );
    });
  }, [searchTerm, filters]);

  // Transformar data para MCServiceCards
  const transformedServices = useMemo(() => {
    return filteredServices.map((service) => ({
      idProvider: service.id,
      image: service.image,
      status: service.status as "active" | "inactive",
      title: service.title,
      price: service.price,
      description: service.description,
      rating: service.rating,
      reviews: service.reviews,
      duration: service.duration,
      type: service.type,
      serviceId: service.serviceId,
      isOwner: service.isOwner,
    }));
  }, [filteredServices]);

  // Toggle cards/list
  const toggleView = (
    <MCToogle value={showCards ? "card" : "list"} onChange={handleToggle} />
  );

  // Search input
  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("services.management.searchPlaceholder")}
        value={searchTerm}
        onChange={setSearchTerm}
      />
    </div>
  );

  // PDF generator
  const pdfGeneratorComponent = (
    <MCPDFButton
      onClick={async () => {
        await MCGeneratePDF({
          columns: [
            { title: t("services.table.service"), key: "servicio" },
            { title: t("services.table.specialty"), key: "especialidad" },
            { title: t("services.table.location"), key: "ubicacion" },
            { title: t("services.table.type"), key: "tipo" },
            { title: t("services.table.price"), key: "precio" },
            { title: t("services.table.duration"), key: "duracion" },
            { title: t("services.table.rating"), key: "rating" },
            { title: t("services.table.status"), key: "estado" },
          ],
          data: filteredServices,
          fileName: "mis-servicios",
          title: t("services.management.title"),
          subtitle: t("services.table.service"),
        });
      }}
    />
  );

  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
    >
      <FilterMyServices
        filters={filters}
        onFiltersChange={(newFilters) =>
          setFilters((prev) => ({ ...prev, ...newFilters }))
        }
      />
    </MCFilterPopover>
  );

  // Paginación
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(transformedServices.length / ITEMS_PER_PAGE);
  const paginatedServices = transformedServices.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
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
              <CalendarX className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle
              className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {activeFiltersCount > 0
                ? t("services.empty.noResults")
                : t("services.empty.noServices")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {activeFiltersCount > 0
              ? t("services.empty.noResultsDescription")
              : t("services.empty.noServicesDescription")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col items-center gap-3">
          {activeFiltersCount > 0 && (
            <MCButton
              variant="outline"
              onClick={clearFilters}
              className={isMobile ? "px-4 py-2" : "px-6 py-2"}
              size="sm"
            >
              {t("services.empty.clearFilters")}
            </MCButton>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );

  // Cards/List table con paginación y empty
  const tableComponent = showCards ? (
    transformedServices.length === 0 ? (
      emptyState
    ) : (
      <>
        <div
          className={`grid gap-4 ${
            isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {paginatedServices.map((service) => (
            <MCServiceCards key={service.serviceId} {...service} />
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    onClick={() => setPage(p)}
                    isActive={page === p}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </>
    )
  ) : filteredServices.length === 0 ? (
    emptyState
  ) : (
    <MyServicesTable services={filteredServices} />
  );

  // Botón para crear nuevo servicio
  const actionPlusComponent = (
    <MCNewButton
      text={t("services.management.newService")}
      onClick={() => navigate(ROUTES.DOCTOR.CREATE_SERVICE)}
    />
  );

  // Métricas
  const metrics = [
    {
      title: t("services.metrics.activeServices"),
      value: filteredServices.filter((s) => s.status === "active").length,
      subtitle: t("services.metrics.activeServicesSubtitle"),
      icon: <CheckCircle />,
    },
    {
      title: t("services.metrics.inactiveServices"),
      value: filteredServices.filter((s) => s.status === "inactive").length,
      subtitle: t("services.metrics.inactiveServicesSubtitle"),
      icon: <Ban />,
    },
    {
      title: t("services.metrics.averageRating"),
      value:
        filteredServices.length > 0
          ? (
              filteredServices.reduce((acc, s) => acc + s.rating, 0) /
              filteredServices.length
            ).toFixed(2)
          : "0.00",
      subtitle: t("services.metrics.averageRatingSubtitle"),
      icon: <Star />,
    },
    {
      title: t("services.metrics.totalRegistered"),
      value: filteredServices.length,
      subtitle: t("services.metrics.totalRegisteredSubtitle"),
      icon: <Layers />,
    },
  ];

  return (
    <MCTablesLayouts
      title={t("services.management.title")}
      metrics={metrics}
      filtersInlineWithTitle
      tableComponent={tableComponent}
      toogleView={toggleView}
      searchComponent={searchComponent}
      pdfGeneratorComponent={pdfGeneratorComponent}
      filterComponent={filterComponent}
      actionPlusComponent={actionPlusComponent}
    />
  );
}

export default MyServicesPage;
