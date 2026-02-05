import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/shared/ui/card";
import { Star, Phone, MapPin, Ellipsis, Building } from "lucide-react";
import MCButton from "./forms/MCButton";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils"; // Asegúrate de importar cn si no está
import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
interface MCCenterCardProps {
  urlImage: string;
  name: string;
  type: string;
  description?: string;
  rating: number;
  reviewCount?: number;
  phone?: string;
  isConnected?: boolean;
  onDetails?: () => void;
  onToggleConnection?: () => void;
}

const MCCentersCards = ({
  urlImage,
  name,
  type,
  description,
  rating,
  reviewCount,
  phone,
  isConnected = false,
  onDetails,
  onToggleConnection,
}: MCCenterCardProps) => {
  const { t } = useTranslation("doctor"); // <-- Cambia "common" por "doctor"
  const isMobile = useIsMobile();
  const userRole = useAppStore((state) => state.user?.role);

  // Nuevo estado local para el toggle
  const [connected, setConnected] = useState(isConnected);

  const handleToggleConnection = () => {
    setConnected((prev) => !prev);
    if (onToggleConnection) onToggleConnection();
  };

  return (
    <Card className="rounded-3xl bg-transparent border border-primary/10 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
      <div className="relative overflow-hidden rounded-3xl border border-primary/5">
        <img
          src={urlImage}
          alt={name}
          className={`w-full object-cover transition-transform duration-500 hover:scale-110 ${
            isMobile ? "h-40" : "h-48"
          }`}
        />
        {/* Popover eliminado */}
      </div>

      <CardContent
        className={`flex flex-col flex-1 ${isMobile ? "pt-3 pb-2" : "pt-4 pb-2"}`}
      >
        <h3
          className={`font-semibold text-primary ${isMobile ? "text-base" : "text-lg"}`}
        >
          {name}
        </h3>
        <p
          className={`
            text-muted-foreground mb-1 line-clamp-2
            ${isMobile ? "text-xs min-h-[20px]" : "text-sm min-h-[24px]"}
          `}
        >
          {type}
        </p>
        <p
          className={`
            text-muted-foreground mb-3 line-clamp-2
            ${isMobile ? "text-xs min-h-[32px]" : "text-sm min-h-[36px]"}
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
              className="text-[#F7B500]"
            />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">
              {reviewCount
                ? `(${reviewCount} ${t("cards.center.reviews", "reviews")})`
                : ""}
            </span>
          </div>

          {!isMobile && <span className="mx-2 text-muted-foreground">•</span>}

          {phone && (
            <div className="flex items-center gap-1">
              <Phone size={isMobile ? 14 : 16} className="text-secondary" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          {userRole === "DOCTOR" ? (
            <>
              <MCButton
                variant={connected ? "primary" : "outline"}
                size={isMobile ? "xs" : "sm"}
                className={cn(
                  "flex-1",
                  isMobile && "text-xs px-2",
                  connected &&
                    "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                  !connected &&
                    "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                )}
                onClick={handleToggleConnection}
              >
                {connected
                  ? t("cards.center.connected", "Connected")
                  : t("cards.center.connect", "Connect")}
              </MCButton>
              <MCButton
                className="flex-1 rounded-full"
                variant="primary"
                onClick={onDetails}
                size={isMobile ? "xs" : "sm"}
              >
                {t("cards.center.viewDetails", "View details")}
              </MCButton>
            </>
          ) : (
            <MCButton
              className="col-span-2 rounded-full"
              variant="primary"
              onClick={onDetails}
              size={isMobile ? "xs" : "sm"}
            >
              {t("cards.center.viewDetails", "Ver detalles")}
            </MCButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MCCentersCards;
