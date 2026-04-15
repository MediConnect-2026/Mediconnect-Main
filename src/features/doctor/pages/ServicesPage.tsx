import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import PhotoGallery from "../components/healthService/PhotoGallery";
import {
  Star,
  Clock,
  Stethoscope,
  Monitor,
  Share2,
  Pencil,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";

import { Card } from "@/shared/ui/card";
import MCButton from "@/shared/components/forms/MCButton";
import { Separator } from "@/shared/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import type { ServiceDetail } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import { useAppStore } from "@/stores/useAppStore";
import { Skeleton } from "@/shared/ui/skeleton";
import i18n from "@/i18n/config";
import { useStartConversation } from "@/lib/hooks/useStartConversation";
import { formatCurrency } from "@/utils/formatCurrency";

const PATIENT_PROFILE_PUBLIC = "/patient/profile/:patientId";
const DOCTOR_PROFILE = "/doctor/profile/:doctorId";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-yellow-400/70"
        }`}
      />
    ))}
  </div>
);

// Skeleton Components
const ServicePageSkeleton = () => {
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-3 sm:gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Photo Gallery Skeleton */}
        <div className="mt-4 sm:mt-6">
          <Skeleton className="w-full h-64 sm:h-96 rounded-2xl" />
        </div>

        {/* Meta Skeleton */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Left column skeleton */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <Skeleton className="h-32 w-full" />
            <Separator />
            <Skeleton className="h-48 w-full" />
            <Separator />
            <Skeleton className="h-64 w-full" />
          </div>

          {/* Right column skeleton */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

function ServicesPage() {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceData, setServiceData] = useState<ServiceDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const { startConversation, isLoading: isStartingConversation } = useStartConversation();

  const isOwner = user?.id === serviceData?.doctorId;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  useEffect(() => {
    if (!serviceId) {
      navigate("/doctor/services"); 
      return;
    }

    const fetchServiceDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await doctorService.getServiceById(Number(serviceId), {
          target: i18n.language || "es", // Asegura que se envíe el idioma actual
          source: i18n.language === "es" ? "en" : "es",
          translate_fields: "nombre,descripcion,modalidad,especialidad.nombre,ubicacion.nombre", // Campos que deseas traducir
        });
        if (response.success && response.data) {
          setServiceData(response.data);
        } else {
          setError(t("service.errors.notFound", "No se pudo cargar el servicio"));
        }
      } catch (err: any) {
        console.error("Error fetching service details:", err);
        setError(err.message || t("service.errors.generic", "Error al cargar el servicio"));
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetails();
  }, [serviceId, navigate, t]);

  // Helper function for relative time
  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return t("service.reviews.today", "Hoy");
    if (diffInDays === 1) return t("service.reviews.yesterday", "Ayer");
    if (diffInDays < 7) return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    }
    const months = Math.floor(diffInDays / 30);
    return `Hace ${months} mes${months > 1 ? 'es' : ''}`;
  };

  // Loading state
  if (loading) {
    return (
      <MCDashboardContent mainWidth="w-[100%]" noBg>
        <ServicePageSkeleton />
      </MCDashboardContent>
    );
  }

  // Error state
  if (error || !serviceData) {
    return (
      <MCDashboardContent mainWidth="w-[100%]" noBg>
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-2xl font-semibold text-foreground">
              {t("service.errors.title", "Error al cargar el servicio")}
            </h2>
            <p className="text-muted-foreground">{error}</p>
            <MCButton onClick={() => navigate("/doctor/services")}>
              {t("service.errors.goBack", "Volver a servicios")}
            </MCButton>
          </div>
        </div>
      </MCDashboardContent>
    );
  }

  // Data preparation
  const galleryImages = serviceData.imagenes
    .sort((a, b) => a.orden - b.orden)
    .map(img => img.url);
  
  const displayedReviews = showAllReviews 
    ? serviceData.resenas 
    : serviceData.resenas.slice(0, 4);

  const doctorFullName = `Dr. ${serviceData.doctor.nombre} ${serviceData.doctor.apellido}`;
  const doctorAvatar = serviceData.doctor.usuario?.fotoPerfil;

  const primaryLocation = serviceData.ubicacion && serviceData.ubicacion.length > 0 
    ? serviceData.ubicacion[0] 
    : null;

  const getPatientId = (reviewId: number) => `patient-${reviewId}`;

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-semibold text-foreground">
              {serviceData.nombre}
            </h1>
            <div className="flex gap-3 sm:gap-4">
              <button
                className="flex items-center gap-1.5 text-sm text-foreground hover:text-secondary transition-colors font-body"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                {copied
                  ? t("service.copied", "¡Copiado!")
                  : t("service.share", "Compartir")}
              </button>
              {isOwner && (
                <Link to={`/doctor/services/edit/${serviceId}`}>
                  <button className="flex items-center gap-1.5 text-sm text-foreground hover:text-secondary transition-colors font-body">
                    <Pencil className="w-4 h-4" />
                    {t("service.edit", "Editar")}
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          {galleryImages.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <PhotoGallery
                images={galleryImages}
                alt={serviceData.nombre}
              />
            </div>
          )}

          {/* Service meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 text-xs sm:text-sm text-muted-foreground font-body">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">
                {serviceData.calificacionPromedio.toFixed(1)}
              </span>
              <span>
                ({serviceData.resenas.length} {serviceData.resenas.length === 1 ? t("service.reviews.titleForOne", "review") : t("service.reviews.title", "reviews")})
              </span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>{serviceData.especialidad.nombre}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>{serviceData.duracionMinutos} {t("service.minutes", "minutos")}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>{serviceData.modalidad}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Doctor info */}
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground mb-4">
                  {t("service.meetDoctor", "Conoce a tu Doctor")}
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0">
                    {doctorAvatar ? (
                      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden">
                        <AvatarImage
                          src={doctorAvatar}
                          alt={doctorFullName}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          {serviceData.doctor.nombre[0]}{serviceData.doctor.apellido[0]}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <MCUserAvatar
                        name={doctorFullName}
                        square
                        size={isMobile ? 64 : 80}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    )}
                  </div>
                  <div className="flex-1 w-full sm:w-auto">
                    <Link
                      to={DOCTOR_PROFILE.replace(":doctorId", serviceData.doctor.usuarioId.toString())}
                      className="font-semibold text-foreground font-body text-base sm:text-lg hover:underline flex items-center gap-1"
                    >
                      {doctorFullName}
                      {serviceData.doctor.estadoVerificacion === "Verificado" && (
                        <BadgeCheck
                          className="w-4 h-4 text-background"
                          fill="#8bb1ca"
                        />
                      )}
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground font-body mt-0.5">
                      {serviceData.especialidad.nombre}
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-3 text-xs sm:text-sm text-muted-foreground font-body">
                      <div>
                        <div>{t("service.stats.reviews", "Reseñas")}</div>
                        <div className="text-foreground font-semibold mt-0.5">
                          {serviceData.resenas.length}
                        </div>
                      </div>
                      <div>
                        <div>{t("service.stats.rating", "Calificación")}</div>
                        <div className="text-foreground font-semibold flex items-center gap-0.5 mt-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline" />
                          {serviceData.calificacionPromedio.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div>
                          {t("service.stats.experience", "Años de experiencia")}
                        </div>
                        <div className="text-foreground font-semibold mt-0.5">
                          {serviceData.doctor.anosExperiencia}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <Link
                      to={DOCTOR_PROFILE.replace(":doctorId", serviceData.doctor.usuarioId.toString())}
                      className="flex-1 sm:flex-none"
                    >
                      <MCButton
                        variant="outline"
                        size="sm"
                        className="font-body text-xs w-full"
                      >
                        {t("service.viewProfile", "Ver perfil")}
                      </MCButton>
                    </Link>
                    {
                      !isOwner && (
                        <MCButton
                          size="sm"
                          className="font-body text-xs w-full flex-1 sm:flex-none"
                          onClick={() => startConversation(serviceData.doctor.usuarioId)}
                          disabled={isStartingConversation}
                        >
                          {isStartingConversation
                            ? t("service.contactingDoctor", "Abriendo chat...")
                            : t("service.contactDoctor", "Contactar Doctor")}
                        </MCButton>    
                      )
                    }
                  </div>
                </div>
              </div>

              <Separator />

              {/* About */}
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground mb-3">
                  {t("service.about", "Acerca de este servicio")}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground font-body leading-relaxed text-justify">
                  {serviceData.descripcion}
                </p>
              </div>

              <Separator />

              {/* Location Map */}
              {primaryLocation && 
               primaryLocation.latitud !== undefined &&
               primaryLocation.longitud !== undefined &&
               !isNaN(primaryLocation.latitud) &&
               !isNaN(primaryLocation.longitud) &&
               isFinite(primaryLocation.latitud) &&
               isFinite(primaryLocation.longitud) && (
                <>
                  <div>
                    <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground mb-3">
                      {t("service.location", "Ubicación")}
                    </h2>
                    <p className="text-sm text-muted-foreground font-body mb-3">
                      <strong>{primaryLocation.nombre}</strong> - {primaryLocation.direccion}
                      {primaryLocation.barrio && (
                        <>, {primaryLocation.barrio.nombre}, {primaryLocation.barrio.seccion.municipio.nombre}, {primaryLocation.barrio.seccion.municipio.provincia.nombre}</>
                      )}
                    </p>
                    <MapScheduleLocation
                      fontSizeVariant="s"
                      initialLocation={{
                        lat: primaryLocation.latitud,
                        lng: primaryLocation.longitud,
                      }}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Reviews */}
              {serviceData.resenas.length > 0 && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                    <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground">
                      {t("service.reviews.title", "Reseñas")}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-body hidden sm:inline">
                        •
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground font-body text-sm sm:text-base">
                          {serviceData.calificacionPromedio.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground font-body text-xs sm:text-sm">
                          ({serviceData.resenas.length} {serviceData.resenas.length === 1 ? 'reseña' : 'reseñas'})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {displayedReviews.map((review) => (
                      <div
                        key={review.id}
                        className="space-y-2 p-4 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0">
                            {review.paciente?.usuario?.fotoPerfil ? (
                              <Avatar className="w-10 h-10">
                                <AvatarImage
                                  src={review.paciente.usuario.fotoPerfil}
                                  alt={`${review.paciente.usuario.nombre} ${review.paciente.usuario.apellido}`}
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <AvatarFallback className="bg-muted text-muted-foreground font-body text-sm">
                                  {review.paciente.usuario.nombre[0]}{review.paciente.usuario.apellido[0]}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <MCUserAvatar
                                name={review.paciente ? `${review.paciente.usuario.nombre} ${review.paciente.usuario.apellido}` : "Usuario"}
                                square
                                size={40}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={PATIENT_PROFILE_PUBLIC.replace(
                                ":patientId",
                                getPatientId(review.id),
                              )}
                              className="font-medium text-sm text-foreground font-body hover:underline block truncate"
                            >
                              {review.paciente ? `${review.paciente.usuario.nombre} ${review.paciente.usuario.apellido}` : "Usuario"}
                            </Link>
                            <div className="flex items-center gap-2 flex-wrap">
                              <StarRating rating={review.calificacion} />
                              <span className="text-xs text-muted-foreground font-body whitespace-nowrap">
                                • {getRelativeTime(review.creadoEn)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground font-body leading-relaxed">
                          {review.comentario}
                        </p>
                      </div>
                    ))}
                  </div>
                  {!showAllReviews && serviceData.resenas.length > 4 && (
                    <MCButton
                      variant="outline"
                      className="mt-6 font-body w-full sm:w-auto"
                      onClick={() => setShowAllReviews(true)}
                    >
                      {t("service.showAllReviews", "Mostrar todas las reseñas")}
                    </MCButton>
                  )}
                </div>
              )}
            </div>

            {/* Right column - Booking card */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-6 shadow-lg border-border">
                <div className="text-center space-y-4">
                  <div>
                    <span className="text-xl sm:text-2xl font-heading text-foreground">
                      {formatCurrency(serviceData.precio)}
                    </span>
                    <span className="text-muted-foreground font-body text-xs sm:text-sm ml-1">
                      {t("service.perPatient", "por paciente")}
                    </span>
                  </div>
                  {!isOwner && (
                    <ScheduleAppointmentDialog
                      idProvider={serviceData.doctor.usuarioId.toString()}
                      idService={serviceId || ""}
                      serviceData={serviceData}
                    >
                      <MCButton className="w-full font-body text-sm sm:text-base py-5 sm:py-6">
                        {t("service.schedule", "Agendar")}
                      </MCButton>
                    </ScheduleAppointmentDialog>
                  )}
                  {/* {isOwner && (
                    <div className="text-sm text-muted-foreground">
                      {t("service.ownService", "Este es tu servicio")}
                    </div>
                  )} */}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default ServicesPage;
