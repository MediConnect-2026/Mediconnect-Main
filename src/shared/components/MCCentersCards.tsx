import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/shared/ui/card";
import { Star, Phone } from "lucide-react";
import MCButton from "./forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { useState } from "react";
import { formatPhone } from "@/utils/phoneFormat";

interface MCCenterCardProps {
  urlImage: string;
  name: string;
  type: string;
  description?: string;
  rating: number;
  reviewCount?: number;
  phone?: string;
  connectionStatus?: "connected" | "not_connected" | "pending";
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
  connectionStatus = "not_connected",
  onDetails,
  onToggleConnection,
}: MCCenterCardProps) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const userRole = useAppStore((state) => state.user?.rol);

  // Estado local para simular el cambio (opcional, puedes quitar si manejas por props)
  const [localStatus, setLocalStatus] = useState(connectionStatus);

  let connectBtnText = t("clinicCard.connect");
  let connectBtnDisabled = false;
  let connectVariant: "primary" | "outline" = "outline";

  if (localStatus === "connected") {
    connectBtnText = t("clinicCard.connected");
    connectVariant = "primary";
  } else if (localStatus === "pending") {
    connectBtnText = t("clinicCard.pending");
    connectBtnDisabled = true;
  }

  const handleToggleConnection = () => {
    if (localStatus === "not_connected") {
      setLocalStatus("pending");
    } else if (localStatus === "connected") {
      setLocalStatus("not_connected");
    }
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
          className={`text-muted-foreground mb-1 line-clamp-2 ${isMobile ? "text-xs min-h-[20px]" : "text-sm min-h-[24px]"}`}
        >
          {type}
        </p>
        <p
          className={`text-muted-foreground mb-3 line-clamp-2 ${isMobile ? "text-xs min-h-[32px]" : "text-sm min-h-[36px]"}`}
        >
          {description || "-"}
        </p>

        <div
          className={`flex w-full justify-between text-primary ${isMobile ? "px-0 text-xs mb-3 flex-wrap gap-1" : "px-1 text-sm mb-4"}`}
        >
          <div className="flex items-center gap-1">
            <Star
              size={isMobile ? 14 : 16}
              fill="#F7B500"
              className="text-[#F7B500]"
            />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">
              {reviewCount ? `(${reviewCount} ${t("clinicCard.reviews")})` : ""}
            </span>
          </div>
          {!isMobile && <span className="mx-2 text-muted-foreground">•</span>}
          {phone && (
            <div className="flex items-center gap-1">
              <Phone size={isMobile ? 14 : 16} className="text-secondary" />
              <span>{formatPhone(phone)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          {userRole === "DOCTOR" ? (
            <>
              <MCButton
                variant={connectVariant}
                size={isMobile ? "xs" : "sm"}
                className={cn(
                  "flex-1",
                  isMobile && "text-xs px-2",
                  localStatus === "connected" &&
                    "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                  localStatus === "not_connected" &&
                    "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                  localStatus === "pending" &&
                    "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed",
                )}
                onClick={handleToggleConnection}
                disabled={connectBtnDisabled}
              >
                {connectBtnText}
              </MCButton>
              <MCButton
                className="flex-1 rounded-full"
                variant="primary"
                onClick={onDetails}
                size={isMobile ? "xs" : "sm"}
              >
                {t("clinicCard.viewProfile")}
              </MCButton>
            </>
          ) : (
            <MCButton
              className="col-span-2 rounded-full"
              variant="primary"
              onClick={onDetails}
              size={isMobile ? "xs" : "sm"}
            >
              {t("clinicCard.viewProfile")}
            </MCButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MCCentersCards;
