import React from "react";
import { Star, MapPin, Globe, Phone, Shield } from "lucide-react";
import { type Clinic } from "@/data/providers";
import { Card, CardContent, CardTitle } from "@/shared/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "../forms/MCButton";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { motion } from "framer-motion";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

type CenterPopupProps = {
  provider: Clinic;
  isConnected?: boolean;
  onConnect?: (id: string) => void;
  navigateFn?: (path: string) => void;
};

const CenterPopup: React.FC<CenterPopupProps> = ({
  provider,
  isConnected,
  onConnect,
  navigateFn,
}) => {
  const userRole = useAppStore((state) => state.user?.role);
  const isMobile = useIsMobile();

  const handleProfileClick = () => {
    if (provider.id && navigateFn) {
      navigateFn(`/center/profile/${provider.id}`);
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
          className={`overflow-hidden rounded-xl border border-primary/5 ${imgHeight}`}
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
          {/* Dirección */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex gap-1.5 cursor-pointer ${textXs} text-muted-foreground`}
              >
                <MapPin className="w-3 h-3 mt-0.5 text-secondary" />
                <span className="line-clamp-2">{provider.address}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {provider.address}
            </TooltipContent>
          </Tooltip>

          {/* Idiomas */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex gap-1 cursor-pointer ${textXs} text-muted-foreground`}
              >
                <Globe className="w-3 h-3 text-secondary" />
                <span className="truncate max-w-[150px]">
                  {provider.languages.join(", ")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{provider.languages.join(", ")}</TooltipContent>
          </Tooltip>

          {/* Teléfono */}
          <a
            href={`tel:${provider.phone}`}
            className={`flex gap-1 ${textXs} text-secondary hover:opacity-80`}
          >
            <Phone className="w-3 h-3" />
            <span className="text-primary">{provider.phone}</span>
          </a>

          {/* Seguros */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex gap-1 cursor-pointer pt-1 border-t ${textXs}`}
              >
                <Shield className="w-3 h-3 text-secondary" />
                <span className="truncate max-w-[150px]">
                  {provider.insurances.join(", ")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{provider.insurances.join(", ")}</TooltipContent>
          </Tooltip>

          {/* Botones */}
          <div className={`flex gap-2 mt-3 ${isMobile && "flex-col"}`}>
            {userRole === "DOCTOR" && (
              <MCButton
                size="xs"
                variant={isConnected ? "primary" : "outline"}
                className="flex-1"
                onClick={() => onConnect?.(provider.id)}
              >
                {isConnected ? "Connected" : "Connect"}
              </MCButton>
            )}

            <MCButton
              size="xs"
              variant="outline"
              className="flex-1"
              onClick={handleProfileClick}
            >
              View Profile
            </MCButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CenterPopup;
