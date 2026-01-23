import React, { useState } from "react";
import { Star, MapPin, Globe, Heart, Building2, Video } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { type Doctor } from "@/data/providers";

type DoctorPopupProps = {
  provider: Doctor;
};

const DoctorPopup: React.FC<DoctorPopupProps> = ({ provider }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Manejo de ubicaciones
  const locations =
    Array.isArray(provider.address) && provider.address.length > 0
      ? provider.address
      : [typeof provider.address === "string" ? provider.address : ""];

  // Modalidad
  const modalities = provider.modality.map((m) => m.toLowerCase());

  // Disponibilidad simplificada para slots
  const slots =
    provider.availability?.map((slot) => ({
      day: slot.dayName,
      date: slot.date,
      count: slot.slots,
    })) ?? [];

  return (
    <div className="group relative overflow-hidden rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-300 border border-border max-w-xs">
      {/* Imagen más pequeña */}
      <div className="relative h-20 overflow-hidden bg-muted">
        <img
          src={provider.image}
          alt={provider.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Botón favorito más pequeño */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-card/90 backdrop-blur-sm flex items-center justify-center shadow hover:bg-card transition-colors"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? "fill-destructive text-destructive"
                : "text-muted-foreground hover:text-destructive"
            }`}
          />
        </button>

        {/* Modalidades más pequeñas */}
        <div className="absolute bottom-1.5 right-1.5 flex gap-1">
          {modalities.includes("presencial") && (
            <div
              className="w-5 h-5 rounded bg-card/95 backdrop-blur-sm flex items-center justify-center shadow"
              title="Presencial"
            >
              <Building2 className="w-3 h-3 text-foreground" />
            </div>
          )}
          {modalities.includes("virtual") && (
            <div
              className="w-5 h-5 rounded bg-success/90 backdrop-blur-sm flex items-center justify-center shadow"
              title="Virtual"
            >
              <Video className="w-3 h-3 text-success-foreground" />
            </div>
          )}
        </div>
      </div>
      <div className="p-1.5 space-y-1.5">
        {/* Nombre y especialidad */}
        <div>
          <Badge className="text-[9px] mb-0.5">{provider.specialty}</Badge>
          <h3 className="text-sm font-bold text-foreground leading-tight">
            {provider.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5">
          <Star className="w-3 h-3 fill-rating text-rating" />
          <span className="text-[11px] font-bold text-foreground">
            {provider.rating}
          </span>
          <span className="text-[9px] text-muted-foreground">
            ({provider.reviewCount ?? 0})
          </span>
        </div>

        {/* Ubicación */}
        <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-medical" />
          <span className="line-clamp-1">{locations[0]}</span>
          {locations.length > 1 && (
            <span className="text-medical font-medium flex-shrink-0">
              +{locations.length - 1}
            </span>
          )}
        </div>

        {/* Idiomas */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Globe className="w-3 h-3 flex-shrink-0 text-medical" />
          <span>{provider.languages.join(", ")}</span>
        </div>

        {/* Seguros */}
        <div className="pt-1 border-t border-border">
          <p className="text-[9px] text-muted-foreground mb-0.5">Seguros:</p>
          <div className="flex gap-0.5 overflow-x-auto pb-0.5 scrollbar-hide">
            {provider.insurances.map((insurance, idx) => (
              <Badge
                key={idx}
                className="text-[9px] whitespace-nowrap px-1 py-0.5"
              >
                {insurance}
              </Badge>
            ))}
          </div>
        </div>

        {/* Disponibilidad */}
        <div className="pt-1 border-t border-border">
          <p className="text-[9px] text-muted-foreground mb-0.5">Disp.:</p>
          <div className="grid grid-cols-6 gap-0.5">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={`text-center py-0.5 px-0.5 rounded transition-colors ${
                  slot.count === null
                    ? "bg-muted/40"
                    : slot.count > 0
                      ? "bg-success-light hover:bg-success-light/80 cursor-pointer"
                      : "bg-muted/60"
                }`}
              >
                <p className="text-[7px] font-medium text-muted-foreground uppercase leading-tight">
                  {slot.day}
                </p>
                <p className="text-[8px] font-bold text-foreground leading-tight">
                  {slot.date}
                </p>
                <p
                  className={`text-[7px] font-semibold mt-0.5 ${
                    slot.count === null
                      ? "text-muted-foreground"
                      : slot.count > 0
                        ? "text-success-dark"
                        : "text-muted-foreground"
                  }`}
                >
                  {slot.count === null ? "—" : slot.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPopup;
