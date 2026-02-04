import { Card, CardContent } from "@/shared/ui/card";
import MCServicesStatus from "./tables/MCServicesStatus";
import {
  Star,
  Clock,
  MapPin,
  Ellipsis,
  ClipboardPlus,
  Video,
} from "lucide-react";
import MCButton from "./forms/MCButton";
import { useTranslation } from "react-i18next";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface MCServiceCardProps {
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
}

const MCServiceCards = ({
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
}: MCServiceCardProps) => {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const getTypeIcon = () => {
    if (type.toLowerCase().includes("mixta"))
      return <ClipboardPlus size={16} className="text-secondary" />;
    if (type.toLowerCase().includes("virtual"))
      return <Video size={16} className="text-secondary" />;
    return <MapPin size={16} className="text-secondary" />;
  };

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
        {/* Overlay para status y elipsis */}
        <div className="absolute top-0 left-0 w-full flex justify-between items-start p-2 pointer-events-none">
          <MCServicesStatus
            status={status}
            variant="card"
            className="pointer-events-auto"
          />
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`
                  z-30 rounded-full border-none border-white/60
                  bg-black/20 backdrop-blur-xl shadow-2xl
                  transition-all duration-700 ease-[cubic-bezier(0.175,0.885,0.32,2.2)]
                  pointer-events-auto
                  ${isMobile ? "p-1" : "p-1.5"}
                `}
                type="button"
              >
                <Ellipsis className="text-white" size={isMobile ? 18 : 20} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className={`
                p-1 flex flex-col gap-0.5 z-40 rounded-xl 
                border border-primary/10 shadow-lg
                ${isMobile ? "min-w-[140px] text-xs" : "min-w-[150px] text-sm"}
              `}
              align="end"
              sideOffset={5}
            >
              <button
                className={`
                  text-left rounded-lg hover:bg-accent transition
                  ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                `}
                type="button"
              >
                Ver servicio
              </button>
              <button
                className={`
                  text-left rounded-lg hover:bg-accent transition
                  ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                `}
                type="button"
              >
                Editar servicio
              </button>
              <button
                className={`
                  text-left rounded-lg hover:bg-accent transition
                  ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                `}
                type="button"
              >
                Desactivar servicio
              </button>
              <button
                className={`
                  text-left rounded-lg hover:bg-destructive/10 
                  text-destructive transition
                  ${isMobile ? "px-2 py-1" : "px-2.5 py-1.5"}
                `}
                type="button"
              >
                Eliminar servicio
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <CardContent
        className={`flex flex-col flex-1 ${isMobile ? "pt-3 pb-2" : "pt-4 pb-2"}`}
      >
        <div
          className={`flex items-center justify-between ${isMobile ? "mb-1" : "mb-1"}`}
        >
          <h3
            className={`font-semibold text-primary ${isMobile ? "text-base" : "text-lg"}`}
          >
            {title}
          </h3>
          <span
            className={`
            bg-accent/50 rounded-full text-primary font-medium
            ${isMobile ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"}
          `}
          >
            {price}
          </span>
        </div>

        <p
          className={`
          text-muted-foreground mb-3 line-clamp-2
          ${isMobile ? "text-xs min-h-[36px]" : "text-sm min-h-[44px]"}
        `}
        >
          {description}
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
              className="text-[#F7B500]"
            />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">
              ({reviews} {t("profile.services.reviews", "reseñas")})
            </span>
          </div>

          {!isMobile && <span className="mx-2 text-muted-foreground">•</span>}

          <div className="flex items-center gap-1">
            <Clock size={isMobile ? 14 : 16} className="text-secondary" />
            <span>{duration}</span>
          </div>

          {!isMobile && <span className="mx-2 text-muted-foreground">•</span>}

          <div className="flex items-center gap-1">
            {getTypeIcon()}
            <span>{type}</span>
          </div>
        </div>

        <MCButton
          className="w-full rounded-full mt-auto"
          variant="primary"
          onClick={onDetails}
          size={isMobile ? "xs" : "sm"}
        >
          {t("profile.services.details", "Ver detalles")}
        </MCButton>
      </CardContent>
    </Card>
  );
};

export default MCServiceCards;
