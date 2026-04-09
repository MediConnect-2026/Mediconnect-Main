import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useDoctorServicesStats } from "@/lib/hooks/useDoctorStats";
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
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { useAppStore } from "@/stores/useAppStore";
import type { GetServicesOfDoctor } from "@/shared/navigation/userMenu/editProfile/doctor/services";
const ITEMS_PER_PAGE = 8;
const TABLE_PAGE_SIZE = 15;

interface MyServiceFilters {
  servicio: string;
  especialidad: string;
  modalidad: string;
  precio: string;
  duracion: string;
  rating: number | null;
  estado: string;
}

function MyServicesPage() {
  const { t } = useTranslation("doctor");
  const { i18n } = useTranslation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const user = useAppStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<GetServicesOfDoctor[]>([]);

  // Hook para obtener estadísticas de servicios desde la API
  const { 
    data: servicesStats, 
    isLoading: isLoadingStats,
    error: statsError,
  } = useDoctorServicesStats();

  // Estados de vista y filtros
  const [showCards, setShowCards] = useState(() => {
    const saved = localStorage.getItem("myServicesView");
    return saved ? saved === "card" : true;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<MyServiceFilters>({
    servicio: "",
    especialidad: "",
    modalidad: "",
    precio: "",
    duracion: "",
    rating: null,
    estado: "all",
  });

  // Estado de paginación independiente para cards y tabla
  const [cardsPage, setCardsPage] = useState(1);
  const [tablePage, setTablePage] = useState(1);

  // Cargar servicios desde la API
  useEffect(() => {
    const loadServices = async () => {
      try {
        if (!user?.id) return;

        setIsLoading(true);

        const response = await doctorService.getServicesOfDoctor(
          Number(user.id),
          {
            target: i18n.language || "es", // Asegura que se envíe el idioma actual
            source: i18n.language === "es" ? "en" : "es",
            translate_fields: "nombre,descripcion,modalidad", // Campos que deseas traducir
          }
        );
        if (response && response.success && Array.isArray(response.data)) {
          setServices(response.data);
        } else {
          setServices([]);
        }
      } catch (error) {
        console.error("Error al cargar los servicios del doctor:", error);
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [user?.id, i18n.language]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== "all" && value !== null
    ).length;
  }, [filters]);

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      servicio: "",
      especialidad: "",
      modalidad: "",
      precio: "",
      duracion: "",
      rating: null,
      estado: "all",
    });
    setSearchTerm("");
    setCardsPage(1);
    setTablePage(1);
  };

  // Función de filtrado completa
  const filteredServices = useMemo(() => {
    let filtered = [...services];

    // Filtro por búsqueda
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.nombre.toLowerCase().includes(searchLower) ||
          service.especialidad.nombre.toLowerCase().includes(searchLower) ||
          service.descripcion?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por servicio
    if (filters.servicio) {
      filtered = filtered.filter((service) =>
        service.nombre.toLowerCase().includes(filters.servicio.toLowerCase())
      );
    }

    // Filtro por especialidad
    if (filters.especialidad) {
      filtered = filtered.filter(
        (service) =>
          service.especialidad.nombre
            .toLowerCase()
            .includes(filters.especialidad.toLowerCase()) ||
          service.especialidad.id.toString() === filters.especialidad
      );
    }

    // Filtro por modalidad
    if (filters.modalidad) {
      const tipoLower = filters.modalidad.toLowerCase();
      filtered = filtered.filter((service) => {
        const modalidad = service.modalidad.toLowerCase();
        
        if (tipoLower === "presencial") {
          return modalidad.includes("presencial");
        } else if (tipoLower === "virtual") {
          return modalidad.includes("virtual") || modalidad.includes("telemedicina");
        } else if (tipoLower === "mixta") {
          return modalidad.includes("mixta") || modalidad.includes("ambos");
        }
        
        return modalidad.includes(tipoLower);
      });
    }
    
    // Filtro por precio
    if (filters.precio) {
      filtered = filtered.filter((service) => {
        const precio = Number(service.precio);
        
        switch (filters.precio) {
          case "0-1000":
            return precio >= 0 && precio <= 1000;
          case "1000-3000":
            return precio > 1000 && precio <= 3000;
          case "3000-5000":
            return precio > 3000 && precio <= 5000;
          case "5000+":
            return precio > 5000;
          default:
            return true;
        }
      });
    }

    // Filtro por duración
    if (filters.duracion) {
      filtered = filtered.filter((service) => {
        const duracion = service.duracionMinutos;
        
        switch (filters.duracion) {
          case "corta":
            return duracion <= 30;
          case "media":
            return duracion >= 30 && duracion <= 45;
          case "larga":
            return duracion >= 45 && duracion <= 60;
          case "extendida":
            return duracion >= 60;
          default:
            return true;
        }
      });
    }

    // Filtro por rating
    if (filters.rating !== null && filters.rating > 0) {
      filtered = filtered.filter(
        (service) => service.calificacionPromedio >= filters.rating!
      );
    }

    // Filtro por estado
    if (filters.estado && filters.estado !== "all") {
      filtered = filtered.filter(
        (service) => {
          const estadoLower = filters.estado.toLowerCase();
          if (estadoLower === "active") {
            return service.estado.toLowerCase() === "activo";
          }
          else if (estadoLower === "inactive") {
            return service.estado.toLowerCase() === "inactivo";
          }
          return service.estado.toLowerCase() === filters.estado.toLowerCase();
      });
    }

    return filtered;
  }, [services, searchTerm, filters]);


  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCardsPage(1);
    setTablePage(1);
  }, [filteredServices.length, activeFiltersCount, searchTerm]);

  // Transformar datos para las cards
  const transformedServicesForCards = useMemo(() => {
    return filteredServices.map((service) => ({
      serviceId: service.id.toString(),
      image:
        service.imagenes && service.imagenes.length > 0
          ? service.imagenes[0].url
          : "https://via.placeholder.com/300x200?text=Servicio",
      status: service.estado.toLowerCase() === "activo" ? ("active" as const) : ("inactive" as const),
      title: service.nombre,
      price: `RD$${service.precio}`,
      description: service.descripcion || "Sin descripción disponible",
      rating: service.calificacionPromedio || 0,
      duration: `${service.duracionMinutos} min`,
      modalidad: service.modalidad,
      isOwner: true,
      onDetails: () => navigate(`/service/${service.id}`),
      onEdit: () => navigate(ROUTES.DOCTOR.EDIT_SERVICE.replace(":serviceId", service.id.toString())),
      onDeactivate: () => handleServiceAction(service.id, "deactivate"),
      onActivate: () => handleServiceAction(service.id, "activate"),
      onDelete: () => handleServiceAction(service.id, "delete"),
    }));
  }, [filteredServices, navigate]);

  // Transformar datos para la tabla
  const transformedServicesForTable = useMemo(() => {
    return filteredServices.map((service) => ({
      id: service.id.toString(),
      servicio: service.nombre,
      especialidad: service.especialidad.nombre,
      ubicacion:
        service.ubicacion && service.ubicacion.length > 0
          ? service.ubicacion.map((u) => u.direccion || u.barrio?.nombre || "").filter(Boolean)
          : ["Virtual"],
      modalidad: service.modalidad,
      precio: `RD$${service.precio}`,
      duracion: `${service.duracionMinutos} min`,
      rating: service.calificacionPromedio || 0,
      estado: service.estado.toLowerCase() === "activo" ? "Activo" : "Inactivo",
      imagen:
        service.imagenes && service.imagenes.length > 0
          ? service.imagenes[0].url
          : "https://via.placeholder.com/100x100?text=Servicio",
      descripcion: service.descripcion || "Sin descripción disponible",
      onEdit: () => navigate(ROUTES.DOCTOR.EDIT_SERVICE.replace(":serviceId", service.id.toString())),
      onDeactivate: () => handleServiceAction(service.id, "deactivate"),
      onActivate: () => handleServiceAction(service.id, "activate"),
      onDelete: () => handleServiceAction(service.id, "delete"),
    }));
  }, [filteredServices]);

  // Paginación para cards
  const totalCardsPages = Math.ceil(
    transformedServicesForCards.length / ITEMS_PER_PAGE
  );
  const paginatedCards = useMemo(() => {
    const start = (cardsPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return transformedServicesForCards.slice(start, end);
  }, [transformedServicesForCards, cardsPage]);

  // Ajustar página si está fuera de rango
  useEffect(() => {
    if (cardsPage > totalCardsPages && totalCardsPages > 0) {
      setCardsPage(totalCardsPages);
    }
  }, [cardsPage, totalCardsPages]);

  useEffect(() => {
    if (tablePage > Math.ceil(transformedServicesForTable.length / TABLE_PAGE_SIZE) && 
        transformedServicesForTable.length > 0) {
      setTablePage(1);
    }
  }, [tablePage, transformedServicesForTable.length]);

  // Handlers para acciones de servicios
  const handleServiceAction = async (
    serviceId: number,
    action: "activate" | "deactivate" | "delete"
  ) => {
    try {
      
      // Recargar servicios después de la acción
      if (user?.id) {
        const response = await doctorService.getServicesOfDoctor(Number(user.id), {
          target: i18n.language || "es", // Asegura que se envíe el idioma actual
          source: i18n.language === "es" ? "en" : "es",
          translate_fields: "nombre,descripcion,modalidad", // Campos que deseas traducir
        });
        if (response?.success && Array.isArray(response.data)) {
          setServices(response.data);
        }
      }
    } catch (error) {
      console.error(`Error al ${action} servicio:`, error);
    }
  };

  // Toggle cards/list
  const handleToggle = (val: string) => {
    const isCard = val === "card";
    setShowCards(isCard);
    localStorage.setItem("myServicesView", isCard ? "card" : "list");
    // Resetear páginas al cambiar vista
    setCardsPage(1);
    setTablePage(1);
  };

  const toggleView = (
    <MCToogle value={showCards ? "card" : "list"} onChange={handleToggle} />
  );

  // Search input
  const searchComponent = (
    <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
      <MCFilterInput
        placeholder={t("services.management.searchPlaceholder")}
        value={searchTerm}
        onChange={(value) => {
          setSearchTerm(value);
          setCardsPage(1);
          setTablePage(1);
        }}
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
            { title: t("services.table.modality"), key: "modalidad" },
            { title: t("services.table.price"), key: "precio" },
            { title: t("services.table.duration"), key: "duracion" },
            { title: t("services.table.rating"), key: "rating" },
            { title: t("services.table.status"), key: "estado" },
          ],
          data: transformedServicesForTable.map((item) => ({
            ...item,
            estado:
              item.estado === "Activo"
                ? t("services.status.active")
                : t("services.status.inactive"),
          })),
          fileName: `${i18n.t("services.management.title")} - ${new Date().getFullYear()}`,
          title: t("services.management.title"),
          subtitle: t("services.table.service"),
        });
      }}
    />
  );

  // Filter component
  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
    >
      <FilterMyServices
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters((prev) => ({ ...prev, ...newFilters }));
          setCardsPage(1);
          setTablePage(1);
        }}
      />
    </MCFilterPopover>
  );

  // Empty state
  const emptyState = (
    <Empty>
      <EmptyHeader>
        <div className="flex flex-col items-center gap-2">
          <span className="flex items-center justify-center gap-2 text-primary">
            {activeFiltersCount > 0 || searchTerm ? (
              <Filter className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            ) : (
              <CalendarX className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
            )}
            <EmptyTitle
              className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}
            >
              {activeFiltersCount > 0 || searchTerm
                ? t("services.empty.noResults")
                : t("services.empty.noServices")}
            </EmptyTitle>
          </span>
          <EmptyDescription
            className={`text-muted-foreground text-center max-w-md mx-auto ${
              isMobile ? "text-sm" : "text-base"
            }`}
          >
            {activeFiltersCount > 0 || searchTerm
              ? t("services.empty.noResultsDescription")
              : t("services.empty.noServicesDescription")}
          </EmptyDescription>
        </div>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col items-center gap-3">
          {(activeFiltersCount > 0 || searchTerm) && (
            <MCButton
              variant="outline"
              onClick={clearFilters}
              className={isMobile ? "px-4 py-2" : "px-6 py-2"}
              size="sm"
            >
              {t("services.empty.clearFilters")}
            </MCButton>
          )}
          {!activeFiltersCount && !searchTerm && (
            <MCButton
              variant="primary"
              onClick={() => navigate(ROUTES.DOCTOR.CREATE_SERVICE)}
              className={isMobile ? "px-4 py-2" : "px-6 py-2"}
              size="sm"
            >
              {t("services.management.newService")}
            </MCButton>
          )}
        </div>
      </EmptyContent>
    </Empty>
  );

  // Loading state
  const loadingState = (
    <div className="flex justify-center items-center p-12 w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-muted-foreground text-lg">
          {t("services.loading", "Cargando servicios...")}
        </span>
      </div>
    </div>
  );

  // Table/Cards component con paginación
  const tableComponent = isLoading ? (
    loadingState
  ) : showCards ? (
    filteredServices.length === 0 ? (
      emptyState
    ) : (
      <>
        <div
          className={`grid gap-4 ${
            isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {paginatedCards.map((service) => (
            <MCServiceCards key={service.serviceId} {...service} />
          ))}
        </div>
        {totalCardsPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCardsPage((p) => Math.max(1, p - 1))}
                  className={
                    cardsPage === 1
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalCardsPages }, (_, i) => i + 1).map(
                (p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      onClick={() => setCardsPage(p)}
                      isActive={cardsPage === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCardsPage((p) => Math.min(totalCardsPages, p + 1))
                  }
                  className={
                    cardsPage === totalCardsPages
                      ? "pointer-events-none opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
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
    <MyServicesTable
      services={transformedServicesForTable}
      onViewDetails={(id) => navigate(`/service/${id}`)}
      onEdit={(serviceId) => navigate(ROUTES.DOCTOR.EDIT_SERVICE.replace(":serviceId", String(serviceId)))}
      onDeactivate={(id) => handleServiceAction(Number(id), "deactivate")}
      onActivate={(id) => handleServiceAction(Number(id), "activate")}
      onDelete={(id) => handleServiceAction(Number(id), "delete")}
    />
  );

  // Botón para crear nuevo servicio
  const actionPlusComponent = (
    <MCNewButton
      text={t("services.management.newService")}
      onClick={() => navigate(ROUTES.DOCTOR.CREATE_SERVICE)}
    />
  );

  // Métricas obtenidas de la API
  const metrics = useMemo(() => {
    // Mostrar valores por defecto mientras se cargan
    if (isLoadingStats) {
      return [
        {
          title: t("services.metrics.activeServices"),
          value: "...",
          subtitle: t("services.metrics.activeServicesSubtitle"),
          icon: <CheckCircle />,
          isLoading: true,
        },
        {
          title: t("services.metrics.inactiveServices"),
          value: "...",
          subtitle: t("services.metrics.inactiveServicesSubtitle"),
          icon: <Ban />,
          isLoading: true,
        },
        {
          title: t("services.metrics.averageRating"),
          value: "...",
          subtitle: t("services.metrics.averageRatingSubtitle"),
          icon: <Star />,
          isLoading: true,
        },
        {
          title: t("services.metrics.totalRegistered"),
          value: "...",
          subtitle: t("services.metrics.totalRegisteredSubtitle"),
          icon: <Layers />,
          isLoading: true,
        },
      ];
    }

    // Mostrar datos de la API
    if (servicesStats) {
      return [
        {
          title: t("services.metrics.activeServices"),
          value: servicesStats.serviciosActivos,
          subtitle: t("services.metrics.activeServicesSubtitle"),
          icon: <CheckCircle />,
        },
        {
          title: t("services.metrics.inactiveServices"),
          value: servicesStats.serviciosInactivos,
          subtitle: t("services.metrics.inactiveServicesSubtitle"),
          icon: <Ban />,
        },
        {
          title: t("services.metrics.averageRating"),
          value: servicesStats.promedioRating.toFixed(2),
          subtitle: t("services.metrics.averageRatingSubtitle"),
          icon: <Star />,
        },
        {
          title: t("services.metrics.totalRegistered"),
          value: servicesStats.totalServicios,
          subtitle: t("services.metrics.totalRegisteredSubtitle"),
          icon: <Layers />,
        },
      ];
    }

    // Fallback si hay error o no hay datos
    return [
      {
        title: t("services.metrics.activeServices"),
        value: 0,
        subtitle: t("services.metrics.activeServicesSubtitle"),
        icon: <CheckCircle />,
      },
      {
        title: t("services.metrics.inactiveServices"),
        value: 0,
        subtitle: t("services.metrics.inactiveServicesSubtitle"),
        icon: <Ban />,
      },
      {
        title: t("services.metrics.averageRating"),
        value: "0.00",
        subtitle: t("services.metrics.averageRatingSubtitle"),
        icon: <Star />,
      },
      {
        title: t("services.metrics.totalRegistered"),
        value: 0,
        subtitle: t("services.metrics.totalRegisteredSubtitle"),
        icon: <Layers />,
      },
    ];
  }, [servicesStats, isLoadingStats, t]);

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