import React from "react";
import { Star, MapPin, Globe, Phone, Shield } from "lucide-react";
import { type Clinic } from "@/data/providers";
import { Card, CardContent, CardTitle } from "@/shared/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "../forms/MCButton";
import { fadeInUp, fadeInUpDelayed } from "@/lib/animations/commonAnimations";
import { motion } from "framer-motion"; // <-- Agrega este import

type CenterPopupProps = {
  provider: Clinic;
  isConnected?: boolean;
  onConnect?: (id: string) => void;
  onViewProfile?: (id: string) => void;
};

const CenterPopup: React.FC<CenterPopupProps> = ({
  provider,
  isConnected,
  onConnect,
  onViewProfile,
}) => {
  const userRole = useAppStore((state) => state.user?.role);

  return (
    <motion.div {...fadeInUp}>
      <Card className="rounded-3xl bg-background border border-primary/10 shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col max-w-xs w-[500px]">
        {/* IMAGE */}
        <div className="relative overflow-hidden rounded-xl border border-primary/5 h-35">
          <img
            src={provider.image}
            alt={provider.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        {/* Nombre y rating juntos debajo de la imagen */}
        <div className="flex items-center justify-between px-2 pt-2">
          <CardTitle className="text-base font-bold text-primary drop-shadow-none m-0">
            {provider.name}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-foreground">
              {provider.rating}
            </span>
          </div>
        </div>

        <CardContent className="p-2 space-y-2">
          {/* Dirección */}
          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-secondary" />
            <span className="line-clamp-2">{provider.address}</span>
          </div>
          {/* Idiomas y Teléfono */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Globe className="w-3 h-3 flex-shrink-0 text-secondary" />
              <span>{provider.languages.join(", ")}</span>
            </div>
            <a
              href={`tel:${provider.phone}`}
              className="flex items-center gap-1 text-xs text-secondary hover:text-secondary/80 font-semibold transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span className="text-primary font-normal">{provider.phone}</span>
            </a>
          </div>
          {/* Seguros con Tooltip */}
          <div className="flex items-center gap-1 pt-1 border-t border-border mt-2">
            <Shield className="w-3 h-3 text-secondary" />
            <span className="text-xs text-muted-foreground font-medium">
              Insurances:
            </span>
            {provider.insurances.length > 2 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer truncate text-xs text-foreground">
                    {provider.insurances.slice(0, 2).join(", ")}
                    <span className="text-secondary ml-1">
                      +{provider.insurances.length - 2} more
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{provider.insurances.join(", ")}</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="truncate text-xs text-foreground">
                {provider.insurances.join(", ")}
              </span>
            )}
          </div>
          {/* Botones de acción solo para DOCTOR */}
          <div className="flex gap-2 mt-3">
            {userRole === "DOCTOR" && (
              <MCButton
                variant={isConnected ? "primary" : "outline"}
                size="xs"
                className={
                  isConnected
                    ? "flex-1 bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80"
                    : "flex-1 border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20"
                }
                onClick={() => onConnect?.(provider.id)}
              >
                {isConnected ? "Connected" : "Connect"}
              </MCButton>
            )}
            <MCButton
              variant="outline"
              size="xs"
              className="flex-1"
              onClick={() => onViewProfile?.(provider.id)}
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
