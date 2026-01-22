import {
  Star,
  MapPin,
  Globe,
  Monitor,
  Shield,
  Calendar,
  Check,
} from "lucide-react";
import { type Doctor } from "@/data/providers";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "@/shared/components/forms/MCButton";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
interface DoctorCardsProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export const DoctorCards = ({
  doctor,
  isSelected,
  onSelect,
  onViewProfile,
}: DoctorCardsProps) => {
  const userRole = useAppStore((state) => state.user?.role);
  const [isConnected, setIsConnected] = useState(doctor.isConnected ?? false);

  const handleConnectToggle = () => {
    setIsConnected((prev) => !prev);
    // Aquí puedes llamar a una función externa si necesitas sincronizar con backend
    // onConnectToggle?.(doctor.id, !isConnected);
  };

  // Handler para ver perfil solo si es paciente
  const handleCardClick = (e: React.MouseEvent) => {
    // Evita que el click en la imagen, slots o botón de selección dispare el evento
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest(".doctor-image") ||
      target.closest(".doctor-slot")
    ) {
      return;
    }
    if (userRole === "PATIENT") {
      onViewProfile(doctor.id);
    }
  };

  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "bg-background p-4 border-b transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-b-primary border-b-2 bg-primary/5 dark:bg-primary/10 rounded-t-4xl "
          : "border-primary/15  hover:bg-muted/30  ",
      )}
      onClick={handleCardClick}
    >
      <div className="flex gap-4 h-full">
        {/* Doctor Image */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/5 doctor-image">
          {doctor.image ? (
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-30 h-full md:w-45 md:h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          ) : (
            <img
              src="https://i.pinimg.com/736x/2c/bb/0e/2cbb0ee6c1c55b1041642128c902dadd.jpg"
              alt="Doctor por defecto"
              className="w-30 h-full md:w-45 md:h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3
                className={cn(
                  "font-semibold text-foreground text-base md:text-lg leading-tight hover:underline cursor-pointer",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/doctor/profile/${doctor.id}`);
                }}
              >
                {doctor.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary text-sm">{doctor.specialty}</span>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{doctor.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({doctor.reviewCount} reseñas)
                  </span>
                </div>
              </div>
            </div>

            {/* Selection checkbox solo si NO es doctor ni centro */}
            {userRole !== "DOCTOR" && userRole !== "CENTER" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(doctor.id);
                }}
                className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center transition-all flex-shrink-0",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground scale-110"
                    : "border-primary/40 hover:border-primary hover:scale-105",
                )}
              >
                {isSelected && <Check className="w-4 h-4 stroke-3" />}
              </button>
            )}
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-secondary" />
            {Array.isArray(doctor.address) && doctor.address.length > 1 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate cursor-pointer">
                    {doctor.address[0]}
                    <span className="text-secondary ml-1 ">
                      y otras {doctor.address.length - 1} ubicaciones...
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-1">
                    {doctor.address.map((addr, idx) => (
                      <span key={idx}>{addr}</span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="line-clamp-1">
                {Array.isArray(doctor.address)
                  ? doctor.address[0]
                  : doctor.address}
              </span>
            )}
          </div>

          {/* Languages & Modality */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="w-4 h-4 text-secondary" />
              {doctor.languages.length > 2 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      {doctor.languages[0]}
                      <span className="text-secondary ml-1">
                        y otros {doctor.languages.length - 1} idiomas...
                      </span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{doctor.languages.join(", ")}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <span>{doctor.languages.join(", ")}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Monitor className="w-4 h-4 text-secondary" />
              <span>{doctor.modality.join(" / ")}</span>
            </div>
          </div>

          {/* Insurances */}
          <div className="flex items-start gap-1.5 mt-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-secondary" />
            <span className="font-medium">Seguros aceptados:</span>{" "}
            {doctor.insurances.length > 2 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer">
                    {doctor.insurances.slice(0, 2).join(", ")}
                    <span className="text-secondary ml-1">
                      y otros {doctor.insurances.length - 2} seguros...
                    </span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{doctor.insurances.join(", ")}</span>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span>{doctor.insurances.join(", ")}</span>
            )}
          </div>

          {/* Availability */}
          {userRole !== "DOCTOR" && userRole !== "CENTER" && (
            <div className="mt-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                <Calendar className="w-4 h-4 text-secondary" />
                <span>Disponibilidad disponible:</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {doctor.availability.slice(0, 6).map((slot, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex flex-col items-center min-w-[50px] px-2 py-1.5 rounded-lg text-xs doctor-slot",
                      slot.slots === 0
                        ? "bg-primary/5 dark:bg-primary/10 border-primary/10 text-primary/25 cursor-not-allowed"
                        : "bg-accent text-accent-foreground border-border cursor-pointer transition-colors hover:border-primary hover:bg-accent/80 active:bg-accent/70",
                    )}
                    // Elimina el onClick o déjalo vacío
                    onClick={(e) => e.preventDefault()}
                    tabIndex={slot.slots === 0 ? -1 : 0}
                    aria-disabled={slot.slots === 0}
                  >
                    <span className="font-medium">{slot.dayName}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {slot.date}
                    </span>
                    <span
                      className={cn(
                        "mt-1 font-semibold",
                        slot.slots === 0
                          ? "text-muted-foreground"
                          : "text-primary dark:text-black",
                      )}
                    >
                      {slot.slots === 0 ? "No" : slot.slots}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      Citas
                    </span>
                  </div>
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(doctor.id);
                  }}
                  className={cn(
                    "flex items-center justify-center min-w-[50px] px-3 py-1.5 rounded-lg border border-primary/5 text-sm font-medium text-foreground transition-colors",
                    "hover:bg-primary/10 hover:border-primary/40 hover:text-primary active:bg-primary/8 active:border-primary active:text-primary",
                  )}
                >
                  Más
                </button>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 mt-4">
            {userRole === "CENTER" ? (
              <>
                <MCButton
                  variant={isConnected ? "primary" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1",
                    isConnected &&
                      "bg-secondary hover:bg-secondary/90 text-white border-none active:bg-secondary/80",
                    !isConnected &&
                      "border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary/80 active:bg-secondary/20",
                  )}
                  disabled={false}
                  onClick={handleConnectToggle}
                >
                  {isConnected ? "Conectado" : "Conectar"}
                </MCButton>
                <MCButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewProfile(doctor.id)}
                >
                  Ver Perfil
                </MCButton>
              </>
            ) : (
              userRole !== "PATIENT" && (
                <MCButton
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewProfile(doctor.id)}
                >
                  Ver Perfil
                </MCButton>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
