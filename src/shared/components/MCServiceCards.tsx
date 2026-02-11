import { Card, CardContent } from "@/shared/ui/card";
import MCServicesStatus from "./tables/MCServicesStatus";
import { Star, Clock, MapPin, ClipboardPlus, Video } from "lucide-react";
import MCButton from "./forms/MCButton";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useNavigate } from "react-router-dom";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import { useAppStore } from "@/stores/useAppStore";
import ServicesActions from "@/features/doctor/components/healthService/ServicesActions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { useRef, useState, useEffect } from "react";
interface MCServiceCardProps {
  idProvider?: string | number;
  image: string;
  status?: "active" | "inactive";
  title: string;
  price: string;
  description: string;
  rating: number;
  reviews: number;
  duration: string;
  type: string;
  onDetails?: () => void;
  isOwner?: boolean;
  serviceId: string; // <-- NUEVA PROP
  onEdit?: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
}

const MCServiceCards = ({
  idProvider,
  image,
  status = "active",
  title,
  price,
  description,
  rating,
  reviews,
  duration,
  type,
  onDetails,
  isOwner = false,
  serviceId,
  onEdit,
  onDeactivate,
  onActivate,
  onDelete,
}: MCServiceCardProps & {
  onEdit?: () => void;
  onDeactivate?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
}) => {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const navigate = useNavigate(); // <-- NAVEGAR
  const currentUser = useAppStore((state) => state.user?.role);

  if (currentUser === "PATIENT") {
    // El usuario es paciente
    // Puedes agregar lógica específica aquí
  }

  const getTypeIcon = () => {
    if (type.toLowerCase().includes("mixta"))
      return <ClipboardPlus size={16} className="text-secondary mb-0.5" />;
    if (type.toLowerCase().includes("virtual"))
      return <Video size={16} className="text-secondary mb-0.5" />;
    return <MapPin size={16} className="text-secondary mb-0.5" />;
  };

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (titleRef.current) {
      setIsTruncated(
        titleRef.current.scrollWidth > titleRef.current.clientWidth,
      );
    }
  }, [title]);

  return (
    <Card className="rounded-3xl bg-transparent border border-primary/10 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative overflow-hidden rounded-3xl border border-primary/5">
        <img
          src={image}
          alt={title}
          className={`w-full object-cover transition-transform duration-500 hover:scale-110 ${
            isMobile ? "h-40" : "h-48"
          }`}
        />
        {/* Overlay para status y acciones */}
        <div className="absolute top-0 left-0 w-full flex justify-between items-start p-2 pointer-events-none">
          {isOwner && (
            <>
              <MCServicesStatus
                status={status}
                variant="card"
                className="pointer-events-auto"
              />
              <div className="pointer-events-auto">
                <ServicesActions
                  isCard
                  status={status}
                  onView={
                    onDetails ?? (() => navigate(`/service/${serviceId}`))
                  }
                  onEdit={onEdit}
                  onDeactivate={onDeactivate}
                  onActivate={onActivate}
                  onDelete={onDelete}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <CardContent
        className={`flex flex-col flex-1 ${isMobile ? "pt-3 pb-2" : "pt-4 pb-2"}`}
      >
        <div
          className={`flex items-center justify-between ${isMobile ? "mb-1" : "mb-1"}`}
        >
          {isTruncated ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3
                    ref={titleRef}
                    className={`font-semibold text-primary ${isMobile ? "text-base" : "text-lg"} truncate max-w-[220px] md:max-w-[320px]`}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </h3>
                </TooltipTrigger>
                <TooltipContent>{title}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <h3
              ref={titleRef}
              className={`font-semibold text-primary ${isMobile ? "text-base" : "text-lg"} truncate max-w-[220px] md:max-w-[320px]`}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </h3>
          )}
          <span
            className={`
            bg-accent/50  dark:bg-bg-btn-secondary rounded-full text-primary font-medium
            ${isMobile ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
          `}
          >
            {price}
          </span>
        </div>

        <p
          className={`
    text-muted-foreground my-1.5 line-clamp-2
    ${isMobile ? "text-xs max-h-[36px] h-fit" : "text-sm max-h-[44px] h-fit"}
  `}
        >
          {description || "-"}
        </p>

        <div
          className={`
          flex w-full justify-between text-primary
          ${isMobile ? "px-0 text-xs mb-3 flex-wrap gap-1" : "px-1 text-sm mb-4"}
        `}
        >
          <div className="flex items-center gap-1">
            <Star
              size={isMobile ? 14 : 16}
              fill="#F7B500"
              className="text-[#F7B500] mb-0.5"
            />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground"></span>
          </div>

          {!isMobile && <span className="mx-2 text-muted-foreground">•</span>}

          <div className="flex items-center gap-1">
            <Clock
              size={isMobile ? 14 : 16}
              className="text-secondary mb-0.5"
            />
            <span>{duration}</span>
          </div>

          {!isMobile && <span className="mx-2 text-muted-foreground">•</span>}

          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span>{type}</span>
          </div>
        </div>

        <div className="w-full mt-auto">
          <MCButton
            className="w-full rounded-full mt-auto"
            variant="primary"
            onClick={() => navigate(`/service/${serviceId}`)}
            size="sm"
          >
            {t("profile.services.details", "Ver detalles")}
          </MCButton>
          {/* Show appointment button only for patients and non-owners */}
          {!isOwner && currentUser === "PATIENT" && (
            <ScheduleAppointmentDialog
              idProvider={idProvider ? String(idProvider) : ""}
            >
              <MCButton
                className="w-full rounded-full mt-3"
                variant="outline"
                size="sm"
              >
                Agendar
              </MCButton>
            </ScheduleAppointmentDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MCServiceCards;
