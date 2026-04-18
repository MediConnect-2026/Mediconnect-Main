import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCServiceCards from "@/shared/components/MCServiceCards";
import FiltersServices from "../filters/FiltersServices";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import { Filter, CalendarX } from "lucide-react";
import MCButton from "@/shared//components/forms/MCButton";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import type { GetServicesOfDoctor } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import { onDoctorServicesChanged } from "@/lib/events/doctorServicesEvents";
import { useAppStore } from "@/stores/useAppStore";
import i18n from "@/i18n/config";
import { Spinner } from "@/shared/ui/spinner";
interface ServiceFilters {
  modalidad: string;
  priceRange: string;
  duration: string;
  rating: number | null;
  status: string;
  isOwner: boolean | null;
}

interface Props {
  doctorId?: number;
  isMyProfile?: boolean;
}

function DoctorServicesSection({ doctorId, isMyProfile = false }: Props) {
  const { t } = useTranslation("doctor");
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();
  const user = useAppStore((state) => state.user);

  console.log(
    "DoctorServicesSection renderizado con doctorId:",
    doctorId,
    "isMyProfile:",
    isMyProfile,
  );

  // Estados para servicios
  const [services, setServices] = useState<GetServicesOfDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros iniciales
  const [filters, setFilters] = useState<ServiceFilters>({
    modalidad: "",
    priceRange: "",
    duration: "",
    rating: null,
    status: "",
    isOwner: null,
  });

  // Función para cargar servicios desde la API
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const idToFetch = doctorId || user?.id;
      if (!idToFetch) {
        throw new Error("No se pudo obtener el ID del doctor");
      }

      const response = await doctorService.getServicesOfDoctor(
        Number(idToFetch),
        {
          target: i18n.language || "es", // Asegura que se envíe el idioma actual
          source: i18n.language === "es" ? "en" : "es",
          translate_fields: "nombre,descripcion,modalidad", // Campos que deseas traducir
        },
      );

      if (response && response.success && Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Error al obtener servicios del doctor:", err);
      setError("Error al cargar los servicios");
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar servicios inicialmente y cuando cambie el doctorId
  useEffect(() => {
    fetchServices();
  }, [doctorId, user?.id]);

  // Escuchar eventos de cambio en servicios del doctor
  useEffect(() => {
    const unsubscribe = onDoctorServicesChanged(() => {
      fetchServices();
    });

    return unsubscribe;
  }, []);

  // Handlers para acciones de servicios
  const handleEdit = (serviceId: string) => {
    console.log("Editar servicio:", serviceId);
    // TODO: Navegar a página de edición o abrir modal
    window.location.href = `/doctor/service/edit/${serviceId}`;
  };

  const handleActivate = async (serviceId: string) => {
    try {
      console.log("Activar servicio:", serviceId);
      await doctorService.updateStatusOfService(Number(serviceId), "Activo");
      fetchServices(); // Recargar servicios
    } catch (error) {
      console.error("Error al activar servicio:", error);
    }
  };

  const handleDeactivate = async (serviceId: string) => {
    try {
      console.log("Desactivar servicio:", serviceId);
      await doctorService.updateStatusOfService(Number(serviceId), "Inactivo");
      fetchServices(); // Recargar servicios
    } catch (error) {
      console.error("Error al desactivar servicio:", error);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      console.log("Eliminar servicio:", serviceId);
      if (
        window.confirm(
          t(
            "profile.services.confirmDelete",
            "¿Estás seguro de que deseas eliminar este servicio?",
          ),
        )
      ) {
        await doctorService.deleteService(Number(serviceId));
        fetchServices(); // Recargar servicios
      }
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
    }
  };

  const handleViewDetails = (serviceId: string) => {
    console.log("Ver detalles del servicio:", serviceId);
    // TODO: Navegar a página de detalles
    window.location.href = `/service/${serviceId}`;
  };

  // Lógica de filtrado
  const filteredServices = services.filter((service) => {
    // Filtro por búsqueda
    const matchesSearch =
      service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.descripcion?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (service.especialidad?.nombre?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      );

    if (!matchesSearch) return false;

    // Filtro por modalidad (tipo)
    if (filters.modalidad) {
      const modalidadLower = service.modalidad.toLowerCase();
      const filterLower = filters.modalidad.toLowerCase();

      if (
        filterLower === "presencial" &&
        !modalidadLower.includes("presencial")
      )
        return false;
      if (
        filterLower === "virtual" &&
        !(
          modalidadLower.includes("virtual") ||
          modalidadLower.includes("telemedicina")
        )
      )
        return false;
      if (
        filterLower === "mixta" &&
        !(modalidadLower.includes("mixta") || modalidadLower.includes("ambos"))
      )
        return false;
    }

    // Filtro por duración (rango)
    if (filters.duration) {
      const duracion = service.duracionMinutos;
      switch (filters.duration) {
        case "corta":
          if (!(duracion >= 15 && duracion <= 30)) return false;
          break;
        case "media":
          if (!(duracion > 30 && duracion <= 45)) return false;
          break;
        case "larga":
          if (!(duracion > 45 && duracion <= 60)) return false;
          break;
        case "extendida":
          if (!(duracion > 60)) return false;
          break;
        default:
          break;
      }
    }

    // Filtro por rango de precio
    if (filters.priceRange) {
      const priceValue = Number(service.precio);
      switch (filters.priceRange) {
        case "0-1000":
          if (!(priceValue >= 0 && priceValue <= 1000)) return false;
          break;
        case "1000-3000":
          if (!(priceValue > 1000 && priceValue <= 3000)) return false;
          break;
        case "3000-5000":
          if (!(priceValue > 3000 && priceValue <= 5000)) return false;
          break;
        case "5000+":
          if (!(priceValue > 5000)) return false;
          break;
        default:
          break;
      }
    }

    // Filtro por rating
    if (
      filters.rating !== null &&
      service.calificacionPromedio < filters.rating
    )
      return false;

    // Filtro por status (solo si eres owner)
    const estadoLower = service.estado.toLowerCase();
    if (filters.status && filters.status !== "all") {
      const filterStatusLower = filters.status.toLowerCase();
      if (filterStatusLower === "active" && estadoLower !== "activo")
        return false;
      if (filterStatusLower === "inactive" && estadoLower !== "inactivo")
        return false;
    }

    // Ocultar servicios inactivos a no owners
    if (estadoLower === "inactivo" && !isMyProfile) return false;

    return true;
  });

  // Componente de filtros
  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={
        Object.values(filters).filter(
          (v) =>
            (typeof v === "string" && v !== "") ||
            (typeof v === "number" && v !== null),
        ).length
      }
      onClearFilters={() =>
        setFilters({
          modalidad: "",
          priceRange: "",
          duration: "",
          rating: null,
          status: "",
          isOwner: null,
        })
      }
    >
      <FiltersServices
        filters={filters}
        onFiltersChange={(partialFilters) =>
          setFilters((prev) => ({ ...prev, ...partialFilters }))
        }
        owner={true}
      />
    </MCFilterPopover>
  );

  // Componente de búsqueda
  const searchComponent = (
    <MCFilterInput
      placeholder={t("profile.services.search", "Buscar servicio...")}
      value={searchTerm}
      onChange={setSearchTerm}
    />
  );

  const hasActiveFilters =
    Object.values(filters).filter(
      (v) =>
        (typeof v === "string" && v !== "") ||
        (typeof v === "number" && v !== null),
    ).length > 0;

  const resetFilters = () =>
    setFilters({
      modalidad: "",
      priceRange: "",
      duration: "",
      rating: null,
      status: "",
      isOwner: null,
    });

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}>
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 w-full">
          <h2
            className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
          >
            {t("profile.services.title", "Servicios ofrecidos")}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto flex-1 sm:flex-none">
              {searchComponent}
            </div>
            {filterComponent}
          </div>
        </div>
      </CardHeader>

      <CardContent className={isMobile ? "p-4 pt-2" : "p-6 pt-4"}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Spinner
                className="w-10 h-10"
                aria-label={t(
                  "profile.services.loading",
                  "Cargando servicios...",
                )}
              />
              <p className="text-muted-foreground">
                {t("profile.services.loading", "Cargando servicios...")}
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <div className="flex flex-col items-center gap-2">
                <span className="flex items-center justify-center gap-2 text-primary">
                  {hasActiveFilters ? (
                    <Filter className="w-7 h-7" />
                  ) : (
                    <CalendarX className="w-7 h-7" />
                  )}
                  <EmptyTitle className="text-xl font-semibold">
                    {hasActiveFilters
                      ? t(
                          "profile.services.noResults",
                          "No se encontraron servicios.",
                        )
                      : t(
                          "profile.services.noServices",
                          "No hay servicios registrados.",
                        )}
                  </EmptyTitle>
                </span>
                <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                  {hasActiveFilters
                    ? t(
                        "profile.services.noResultsDescription",
                        "Intenta limpiar los filtros o buscar otro servicio.",
                      )
                    : t(
                        "profile.services.noServicesDescription",
                        "Agrega servicios para que los pacientes puedan reservar.",
                      )}
                </EmptyDescription>
              </div>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-col items-center gap-3">
                {hasActiveFilters ? (
                  <MCButton
                    variant="outline"
                    onClick={resetFilters}
                    className="px-6 py-2"
                    size="sm"
                  >
                    {t("profile.services.clearFilters", "Limpiar filtros")}
                  </MCButton>
                ) : null}
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              // Obtener la primera imagen o usar una por defecto
              const imageUrl =
                service.imagenes && service.imagenes.length > 0
                  ? service.imagenes[0].url
                  : "https://i.pinimg.com/736x/26/96/86/2696865c46c902b5a2a0cdd58b98ba95.jpg";

              // Mapear el estado de la API al formato esperado por el componente
              const status =
                service.estado.toLowerCase() === "activo"
                  ? ("active" as const)
                  : ("inactive" as const);

              return (
                <MCServiceCards
                  key={service.id}
                  idProvider={doctorId}
                  image={imageUrl}
                  status={status}
                  title={service.nombre}
                  price={`RD$${service.precio.toLocaleString()}`}
                  serviceId={service.id.toString()}
                  description={service.descripcion || ""}
                  rating={service.calificacionPromedio}
                  reviews={0} // TODO: Agregar reviews cuando esté disponible en la API
                  duration={`${service.duracionMinutos} min`}
                  modalidad={service.modalidad}
                  isOwner={isMyProfile}
                  onDetails={() => handleViewDetails(service.id.toString())}
                  // Solo pasar handlers si es el owner
                  {...(isMyProfile && {
                    onEdit: () => handleEdit(service.id.toString()),
                    onActivate:
                      status === "inactive"
                        ? () => handleActivate(service.id.toString())
                        : undefined,
                    onDeactivate:
                      status === "active"
                        ? () => handleDeactivate(service.id.toString())
                        : undefined,
                    onDelete: () => handleDelete(service.id.toString()),
                  })}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DoctorServicesSection;
