import { Star, MapPin, Globe, Phone, X, Building2 } from "lucide-react";
import { type Provider } from "@/data/providers";
import { Button } from "@/shared/ui/button";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import { useState } from "react";

interface ProviderMapPopupProps {
  provider: Provider;
  onViewProfile: () => void;
  onClose: () => void;
}

export const DoctorMapPopup = ({
  provider,
  onViewProfile,
  onClose,
}: ProviderMapPopupProps) => {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const hasAvatar = Boolean(provider.image && provider.image.trim()) && !avatarFailed;

  const getSubtitle = () => {
    if (provider.type === "doctor") {
      return provider.specialty;
    }
    return provider.specialties?.slice(0, 2).join(", ") || "Clínica";
  };

  return (
    <div className="p-3 min-w-[280px]">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex gap-3">
        <div
          className={`w-16 h-16 rounded-full object-cover flex-shrink-0 overflow-hidden ${provider.type === "clinic" ? "border-2 border-blue-200 bg-blue-50" : ""}`}
        >
          {hasAvatar ? (
            <img
              src={provider.image}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <MCUserAvatar
              name={provider.name}
              size={64}
              square={false}
              className="rounded-full"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {provider.type === "clinic" && (
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
            )}
            <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-1">
              {provider.name}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-primary text-xs">{getSubtitle()}</span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{provider.rating}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-start gap-1.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{provider.address}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          <span>{provider.languages.join(", ")}</span>
        </div>
        {provider.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            <span>{provider.phone}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={onViewProfile}
        >
          Ver Perfil
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={onViewProfile}
        >
          {provider.type === "clinic" ? "Conectar" : "Agendar Cita"}
        </Button>
      </div>
    </div>
  );
};
