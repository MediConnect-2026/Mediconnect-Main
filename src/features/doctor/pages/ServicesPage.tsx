import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
} from "lucide-react";

import { Card } from "@/shared/ui/card";
import MCButton from "@/shared/components/forms/MCButton";
import { Separator } from "@/shared/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import gallery1 from "@/assets/tryOuts/0a2523c730e041428f78c4cba0930230~tplv-jj85edgx6n-image-origin.jpeg";

import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile"; // Asume que existe este hook

const galleryImages = [
  gallery1,
  gallery1,
  gallery1,
  gallery1,
  gallery1,
  gallery1,
];

const PATIENT_PROFILE_PUBLIC = "/patient/profile/:patientId";
const DOCTOR_PROFILE_PUBLIC = "/doctor/profile/:doctorId";
const CHAT_WITH = "/chat/:conversationId";
const doctorAvatar =
  "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771694159/Register-Doctor_wiwfsg.png";
const reviews = [
  {
    id: "user-1",
    name: "Christian Bautista",
    time: "Hace 1 día",
    rating: 5,
    text: "Excelente atención. El doctor fue muy atento y explicó todo con calma. Se nota que se preocupan por el bienestar de sus pacientes.",
    avatar: doctorAvatar,
  },
  {
    id: "user-2",
    name: "María González",
    time: "Hace 3 días",
    rating: 5,
    text: "Muy profesional y amable. La consulta fue muy completa y me sentí muy cómoda. Recomendado al 100%.",
    avatar: doctorAvatar,
  },
  {
    id: "user-3",
    name: "Carlos Méndez",
    time: "Hace 1 semana",
    rating: 4,
    text: "Buen servicio médico. El doctor se tomó el tiempo de explicar todo detalladamente. El único detalle fue la espera.",
    avatar: doctorAvatar,
  },
  {
    id: "user-4",
    name: "Ana Pérez",
    time: "Hace 2 semanas",
    rating: 5,
    text: "Excelente experiencia. El trato fue humano y profesional. Sin duda volveré para mis próximas consultas.",
    avatar: doctorAvatar,
  },
  {
    id: "user-5",
    name: "Carlos Méndez",
    time: "Hace 1 semana",
    rating: 4,
    text: "Buen servicio médico. El doctor se tomó el tiempo de explicar todo detalladamente. El único detalle fue la espera.",
    avatar: doctorAvatar,
  },
  {
    id: "user-6",
    name: "Ana Pérez",
    time: "Hace 2 semanas",
    rating: 5,
    text: "Excelente experiencia. El trato fue humano y profesional. Sin duda volveré para mis próximas consultas.",
    avatar: doctorAvatar,
  },
];

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

function ServicesPage() {
  const { serviceId } = useParams();
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const isOwner = true;
  const [copied, setCopied] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  // Simulación de IDs para ejemplo
  const doctorId = "1";
  const getPatientId = (name: string) => name.toLowerCase().replace(/\s/g, "-");

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-semibold text-foreground">
              {t("service.title", "Consulta de Medicina Familiar")}
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
              {!isOwner && (
                <button className="flex items-center gap-1.5 text-sm text-foreground hover:text-secondary transition-colors font-body">
                  <Pencil className="w-4 h-4" />
                  {t("service.edit", "Editar")}
                </button>
              )}
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="mt-4 sm:mt-6">
            <PhotoGallery
              images={galleryImages}
              alt={t("service.photoAlt", "Consulta médica")}
            />
          </div>

          {/* Service meta */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 text-xs sm:text-sm text-muted-foreground font-body">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">4.8</span>
              <span>({t("service.reviewCount", "12 reseñas")})</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>{t("service.specialty", "Medicina Familiar")}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>{t("service.duration", "60 minutos")}</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1">
              <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>{t("service.type", "Presencial / mixta")}</span>
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
                          alt="Dr. Cristiano Ronaldo"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          CR
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <MCUserAvatar
                        name="Dr. Cristiano Ronaldo"
                        square
                        size={isMobile ? 64 : 80}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    )}
                  </div>
                  <div className="flex-1 w-full sm:w-auto">
                    <Link
                      to={DOCTOR_PROFILE_PUBLIC.replace(":doctorId", doctorId)}
                      className="font-semibold text-foreground font-body text-base sm:text-lg hover:underline flex items-center gap-1"
                    >
                      Dr. Cristiano Ronaldo
                      <BadgeCheck
                        className="w-4 h-4 text-background"
                        fill="#8bb1ca"
                      />
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground font-body mt-0.5">
                      {t("service.specialty", "Medicina Familiar")}
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-3 text-xs sm:text-sm text-muted-foreground font-body">
                      <div>
                        <div>{t("service.stats.reviews", "Reseñas")}</div>
                        <div className="text-foreground font-semibold mt-0.5">
                          23
                        </div>
                      </div>
                      <div>
                        <div>{t("service.stats.rating", "Calificación")}</div>
                        <div className="text-foreground font-semibold flex items-center gap-0.5 mt-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 inline" />
                          4.9
                        </div>
                      </div>
                      <div>
                        <div>
                          {t("service.stats.experience", "Años de experiencia")}
                        </div>
                        <div className="text-foreground font-semibold mt-0.5">
                          2
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <Link
                      to={DOCTOR_PROFILE_PUBLIC.replace(":doctorId", doctorId)}
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
                    <Link
                      to={CHAT_WITH.replace(":conversationId", doctorId)}
                      className="flex-1 sm:flex-none"
                    >
                      <MCButton size="sm" className="font-body text-xs w-full">
                        {t("service.contactDoctor", "Contactar Doctor")}
                      </MCButton>
                    </Link>
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
                  {t(
                    "service.description",
                    "Atención integral para toda la familia, enfocada en prevenir, diagnosticar y tratar enfermedades comunes. Nuestro médico de familia acompaña a cada paciente en todas las etapas de la vida, considerando su bienestar físico, emocional y social.",
                  )}
                </p>
              </div>

              <Separator />

              <MapScheduleLocation
                fontSizeVariant="s"
                initialLocation={{
                  lat: 18.47267,
                  lng: -69.94101,
                }}
              />

              <Separator />

              {/* Reviews */}
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
                        4.8
                      </span>
                      <span className="text-muted-foreground font-body text-xs sm:text-sm">
                        ({t("service.reviewCount", "12 reseñas")})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {displayedReviews.map((review, i) => (
                    <div
                      key={i}
                      className="space-y-2 p-4 sm:p-0 bg-muted/30 sm:bg-transparent rounded-lg sm:rounded-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0">
                          {review.avatar ? (
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={review.avatar}
                                alt={review.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                              <AvatarFallback className="bg-muted text-muted-foreground font-body text-sm">
                                {review.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <MCUserAvatar
                              name={review.name}
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
                            {review.name}
                          </Link>
                          <div className="flex items-center gap-2 flex-wrap">
                            <StarRating rating={review.rating} />
                            <span className="text-xs text-muted-foreground font-body whitespace-nowrap">
                              • {review.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
                {!showAllReviews && (
                  <MCButton
                    variant="outline"
                    className="mt-6 font-body w-full sm:w-auto"
                    onClick={() => setShowAllReviews(true)}
                  >
                    {t("service.showAllReviews", "Mostrar todas las reseñas")}
                  </MCButton>
                )}
              </div>
            </div>

            {/* Right column - Booking card */}
            <div className="lg:col-span-1 order-first lg:order-last">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-6 shadow-lg border-border">
                <div className="text-center space-y-4">
                  <div>
                    <span className="text-xl sm:text-2xl font-heading text-foreground">
                      RD$1500
                    </span>
                    <span className="text-muted-foreground font-body text-xs sm:text-sm ml-1">
                      {t("service.perPatient", "por paciente")}
                    </span>
                  </div>
                  <ScheduleAppointmentDialog
                    idProvider={doctorId}
                    idService={serviceId || ""}
                  >
                    <MCButton className="w-full font-body text-sm sm:text-base py-5 sm:py-6">
                      {t("service.schedule", "Agendar")}
                    </MCButton>
                  </ScheduleAppointmentDialog>
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
