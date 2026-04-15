import React from "react";
import { Star, MapPin, Globe, Phone, Shield } from "lucide-react";
import { type Clinic } from "@/data/providers";
import { Card, CardContent, CardTitle } from "@/shared/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import MCButton from "../forms/MCButton";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { motion } from "framer-motion";
import { formatPhone } from "@/utils/phoneFormat";

type CenterPopupProps = {
  provider: Clinic;
  isConnected?: boolean;
  onConnect?: (id: string) => void;
  navigateFn?: (path: string) => void;
  userRole?: string | null;
  isMobile?: boolean;
  translations?: {
    connect: string;
    connected: string;
    pending: string;
    viewProfile: string;
  };
};

const CenterPopup: React.FC<CenterPopupProps> = ({
  provider,
  isConnected,
  onConnect,
  navigateFn,
  userRole,
  isMobile = false,
  translations = {
    connect: "Conectar",
    connected: "Conectado",
    pending: "Pendiente",
    viewProfile: "Ver perfil",
  },
}) => {
  const connectionStatus =
    provider.connectionStatus ??
    (isConnected === true ? "connected" : "not_connected");

  // Helpers
  const addressText = Array.isArray(provider.address)
    ? provider.address.filter(Boolean).join(", ").trim()
    : (provider.address ?? "").trim();
  const hasAddress = addressText.length > 0;
  const languages = provider.languages?.filter(Boolean) ?? [];
  const hasPhone = !!provider.phone?.trim();
  const insurances = provider.insurances?.filter(Boolean) ?? [];

  let connectBtnText = translations.connect;
  let connectBtnDisabled = false;
  let connectVariant: "primary" | "outline" = "outline";

  if (connectionStatus === "connected") {
    connectBtnText = translations.connected;
    connectVariant = "primary";
  } else if (connectionStatus === "pending") {
    connectBtnText = translations.pending;
    connectBtnDisabled = true;
  }

  const handleProfileClick = () => {
    if (provider.id && navigateFn) {
      navigateFn(`/center/profile/${provider.id}`);
    }
  };

  const handleConnect = () => {
    if (connectionStatus === "not_connected") {
      onConnect?.(provider.id);
    }
  };

  const cardSize = isMobile ? "w-[260px] rounded-2xl" : "w-[480px] rounded-3xl";
  const imgHeight = isMobile ? "h-28" : "h-36";
  const textXs = isMobile ? "text-[11px]" : "text-xs";

  return (
    <motion.div {...fadeInUp}>
      <Card
        className={`bg-background border border-primary/10 shadow-sm hover:shadow-lg transition-shadow flex flex-col ${cardSize}`}
      >
        {/* Imagen */}
        <div
          className={`overflow-hidden rounded-xl border border-primary/15 ${imgHeight}`}
        >
          <img
            src={provider.image}
            alt={provider.name}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>

        {/* Nombre + rating */}
        <div className="flex justify-between px-3 pt-2">
          <CardTitle
            className={
              isMobile ? "text-sm font-semibold" : "text-base font-bold"
            }
          >
            {provider.name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold">{provider.rating}</span>
          </div>
        </div>

        <CardContent className="p-2 space-y-2">
          <div
            className={
              isMobile ? "space-y-2" : "grid grid-cols-2 gap-x-3 gap-y-2"
            }
          >
            {/* Dirección — oculto si vacío */}
            {hasAddress && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex gap-1.5 cursor-pointer ${textXs} text-muted-foreground`}
                  >
                    <MapPin className="w-3 h-3 mt-0.5 text-secondary" />
                    <span className="line-clamp-2">{addressText}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {addressText}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Idiomas — oculto si array vacío */}
            {languages.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex gap-1 cursor-pointer ${textXs} text-muted-foreground`}
                  >
                    <Globe className="w-3 h-3 text-secondary" />
                    <span className="truncate max-w-[150px]">
                      {languages.join(", ")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{languages.join(", ")}</TooltipContent>
              </Tooltip>
            )}

            {/* Teléfono — oculto si vacío */}
            {hasPhone && (
              <a
                href={`tel:${provider.phone}`}
                className={`flex gap-1 ${textXs} text-secondary hover:opacity-80`}
              >
                <Phone className="w-3 h-3" />
                <span className="text-primary">
                  {formatPhone(provider.phone)}
                </span>
              </a>
            )}

            {/* Seguros — oculto si array vacío */}
            {insurances.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`flex gap-1 cursor-pointer ${textXs}`}>
                    <Shield className="w-3 h-3 text-secondary" />
                    <span className="truncate max-w-[150px]">
                      {insurances.join(", ")}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{insurances.join(", ")}</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className="my-3 h-[1px] w-full rounded-full bg-gradient-to-r from-primary/5 via-primary/30 to-primary/5" />

          {/* Botones */}
          <div
            className={`flex gap-2 mt-3 ${isMobile ? "flex-col" : "flex-row"}`}
          >
            {userRole === "DOCTOR" && (
              <MCButton
                size="xs"
                variant={connectVariant}
                className={[
                  "flex-1 w-full",
                  isMobile && "text-xs px-2",
                  connectionStatus === "connected" &&
                    "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                  connectionStatus === "not_connected" &&
                    "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                  connectionStatus === "pending" &&
                    "border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={connectBtnDisabled}
                onClick={handleConnect}
              >
                {connectBtnText}
              </MCButton>
            )}
            <MCButton
              size="xs"
              variant="outline"
              className="flex-1 w-full"
              onClick={handleProfileClick}
            >
              {translations.viewProfile}
            </MCButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CenterPopup;
