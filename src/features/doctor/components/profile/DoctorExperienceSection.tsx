import { useRef, useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Briefcase } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import MCButton from "@/shared/components/forms/MCButton";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";
import type { ExperienciaLaboral } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types";
import { onExperienceChanged } from "@/lib/events/experienceEvents";

interface Props {
  doctorId: number;
  isMyProfile?: boolean;
  onOpenSheet?: () => void;
}

interface ExperienceItemProps {
  experiencia: ExperienciaLaboral;
  formatPeriod: (fechaInicio: string, fechaFinalizacion: string | null, trabajaActualmente: boolean) => string;
}

const ExperienceItem = ({ experiencia, formatPeriod }: ExperienceItemProps) => {
  const institutionRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    const el = institutionRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  };

  const handleMouseLeave = () => setShowTooltip(false);

  return (
    <li className="space-y-1">
      <div className="flex gap-2 items-center ">
        <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
        <TooltipProvider>
          <Tooltip open={showTooltip}>
            <TooltipTrigger asChild>
              <div
                ref={institutionRef}
                className="font-semibold max-w-full truncate cursor-pointer"
                style={{ maxWidth: "100%" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {experiencia.institucion}
              </div>
            </TooltipTrigger>
            <TooltipContent>{experiencia.institucion}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="text-sm">{experiencia.posicion}</div>
      <div className="text-xs text-muted-foreground">
        {formatPeriod(experiencia.fechaInicio, experiencia.fechaFinalizacion, experiencia.trabajaActualmente)}
      </div>
      {experiencia.ubicacion && (
        <div className="text-xs text-muted-foreground">{experiencia.ubicacion}</div>
      )}
    </li>
  );
};

const DoctorExperienceSection = ({ doctorId, isMyProfile = false, onOpenSheet }: Props) => {
  const { t, i18n } = useTranslation("doctor");
  const [experiencias, setExperiencias] = useState<ExperienciaLaboral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Función memoizada para cargar experiencias
  const fetchExperiencias = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await doctorService.getExperienciasLaboralesByDoctorId(doctorId, {
        target: i18n.language,
        translate_fields: 'posicion,institucion,descripcion'
      });
      setExperiencias(response.data.experiencias || []);
    } catch (err) {
      console.error("❌ Error al obtener experiencias laborales:", err);
      setError("Error al cargar las experiencias laborales");
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language]);

  // ✅ Cargar experiencias al montar y cuando cambie el idioma
  useEffect(() => {
    if (doctorId) {
      fetchExperiencias();
    }
  }, [doctorId, fetchExperiencias]);

  // ✅ Escuchar eventos de cambios en experiencias
  useEffect(() => {
    const unsubscribe = onExperienceChanged(() => {
      fetchExperiencias();
    });

    return unsubscribe;
  }, [fetchExperiencias]);

  // Función para formatear el período de la experiencia
  const formatPeriod = (fechaInicio: string, fechaFinalizacion: string | null, trabajaActualmente: boolean) => {
    const startYear = new Date(fechaInicio).getFullYear();
    if (trabajaActualmente) {
      return `${startYear} - ${t("profile.experience.present", "Presente")}`;
    }
    const endYear = fechaFinalizacion ? new Date(fechaFinalizacion).getFullYear() : '';
    return `${startYear}${endYear ? ` - ${endYear}` : ''}`;
  };
  
  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          <span className="inline-flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-secondary" />
            {t("profile.experience.title", "Experiencia Profesional")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              {t("profile.experience.loading", "Cargando experiencia profesional...")}
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : experiencias.length > 0 ? (
          <ul className="space-y-3">
            {experiencias.map((experiencia) => (
              <ExperienceItem
                key={experiencia.id}
                experiencia={experiencia}
                formatPeriod={formatPeriod}
              />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center px-6">
            <p className="text-muted-foreground mb-4 text-sm">
              {isMyProfile
                ? t(
                    "profile.experience.addExperience",
                    "Agrega tu experiencia profesional para completar tu perfil",
                  )
                : t(
                    "profile.experience.noExperience",
                    "Este doctor no ha registrado su experiencia profesional.",
                  )}
            </p>
            {isMyProfile && onOpenSheet && (
              <MCButton variant="outline" onClick={onOpenSheet} size="sm">
                {t(
                  "profile.experience.addButton",
                  "Agregar experiencia profesional",
                )}
              </MCButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorExperienceSection;
