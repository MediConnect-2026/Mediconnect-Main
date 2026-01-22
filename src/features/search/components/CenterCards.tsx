import { Star, MapPin, Globe, Phone, Shield } from "lucide-react";
import { type Clinic } from "@/data/providers";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
interface ClinicCardProps {
  clinic: Clinic;
  isConnected: boolean;
  onConnect: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export const CenterCards = ({
  clinic,
  isConnected,
  onConnect,
  onViewProfile,
}: ClinicCardProps) => {
  const userRole = useAppStore((state) => state.user?.role);

  return (
    <div className="bg-card rounded-xl p-5 border border-border transition-all duration-200 hover:shadow-md">
      <div className="flex gap-5 items-start">
        {/* Clinic Logo */}
        <div className="flex-shrink-0">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-primary/20 bg-primary/5">
            <img
              src={clinic.image}
              alt={clinic.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Clinic Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-semibold text-foreground text-lg leading-tight">
              {clinic.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{clinic.rating}</span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{clinic.address}</span>
          </div>

          {/* Languages & Phone */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mb-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Globe className="w-4 h-4" />
              <span>{clinic.languages.join(", ")}</span>
            </div>
            {clinic.phone && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{clinic.phone}</span>
              </div>
            )}
          </div>

          {/* Insurances */}
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-4">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              <span className="font-medium">Seguros aceptados:</span>{" "}
              {clinic.insurances.join(", ")}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {userRole === "DOCTOR" ? (
              <>
                <Button
                  variant={isConnected ? "default" : "outline"}
                  className={cn("flex-1", isConnected && "bg-primary/90")}
                  onClick={() => onConnect(clinic.id)}
                  disabled={isConnected}
                >
                  {isConnected ? "Conectado" : "Conectar"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onViewProfile(clinic.id)}
                >
                  Ver Perfil
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onViewProfile(clinic.id)}
              >
                Ver Perfil
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
