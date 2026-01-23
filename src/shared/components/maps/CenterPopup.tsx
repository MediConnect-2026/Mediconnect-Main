import React from "react";
import { Star, MapPin, Globe, Phone } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { type Clinic } from "@/data/providers";
type CenterPopupProps = {
  provider: Clinic;
};

const CenterPopup: React.FC<CenterPopupProps> = ({ provider }) => {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-none shadow-sm hover:shadow-md transition-all duration-300 border border-border max-w-xs">
      {/* Imagen más pequeña */}
      <div className="relative h-28 overflow-hidden">
        <img
          src={provider.image}
          alt={provider.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

        {/* Rating */}
        <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded px-2 py-0.5 flex items-center gap-1 shadow">
          <Star className="w-3 h-3 fill-rating text-rating" />
          <span className="text-xs font-bold text-foreground">
            {provider.rating}
          </span>
        </div>

        {/* Nombre */}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1">
          <h3 className="text-base font-bold text-primary-foreground drop-shadow">
            {provider.name}
          </h3>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-2 space-y-2">
        {/* Dirección */}
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-medical" />
          <span className="line-clamp-2">{provider.address}</span>
        </div>

        {/* Idiomas y Teléfono */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="w-3 h-3 flex-shrink-0 text-medical" />
            <span>{provider.languages.join(", ")}</span>
          </div>

          <a
            href={`tel:${provider.phone}`}
            className="flex items-center gap-1 text-xs text-medical hover:text-medical-dark font-semibold transition-colors"
          >
            <Phone className="w-3 h-3" />
            {provider.phone}
          </a>
        </div>

        {/* Seguros */}
        <div className="pt-1 border-t border-border">
          <p className="text-[10px] text-muted-foreground mb-1">Seguros:</p>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {provider.insurances.map((insurance, idx) => (
              <Badge
                key={idx}
                className="text-[10px] px-1 py-0.5 whitespace-nowrap"
              >
                {insurance}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterPopup;
